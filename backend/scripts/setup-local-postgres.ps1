$ErrorActionPreference = 'Stop'

$pgData = 'C:\Program Files\PostgreSQL\18\data'
$pgHba = Join-Path $pgData 'pg_hba.conf'
$backupPath = "$pgHba.bak"
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
$serviceName = 'postgresql-x64-18'

if (-not (Test-Path $psql)) {
    throw "PostgreSQL client not found at $psql"
}

if (-not (Test-Path $pgHba)) {
    throw "PostgreSQL HBA config not found at $pgHba"
}

Copy-Item -Force $pgHba $backupPath

$lines = Get-Content $pgHba
$updated = @()
foreach ($line in $lines) {
    $trimmed = $line.TrimStart()
    if ($trimmed -match '^local\s+all\s+all\s+scram-sha-256') {
        $updated += $line.Replace('scram-sha-256', 'trust')
    }
    elseif ($trimmed -match '^host\s+all\s+all\s+127\.0\.0\.1/32\s+scram-sha-256') {
        $updated += $line.Replace('scram-sha-256', 'trust')
    }
    elseif ($trimmed -match '^host\s+all\s+all\s+::1/128\s+scram-sha-256') {
        $updated += $line.Replace('scram-sha-256', 'trust')
    }
    else {
        $updated += $line
    }
}
Set-Content -Path $pgHba -Value ($updated -join [Environment]::NewLine) -Encoding ASCII

& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' -D $pgData -l (Join-Path $pgData 'pg_reload.log') reload

& $psql -U postgres -h localhost -d postgres -v ON_ERROR_STOP=1 -c "ALTER USER postgres WITH PASSWORD 'janseva';"
& $psql -U postgres -h localhost -d postgres -v ON_ERROR_STOP=1 -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'janseva') THEN CREATE ROLE janseva LOGIN PASSWORD 'janseva'; END IF; END $$;"
& $psql -U postgres -h localhost -d postgres -v ON_ERROR_STOP=1 -c "SELECT 'CREATE DATABASE janseva OWNER janseva' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'janseva')\gexec"

if (Test-Path $backupPath) {
    Copy-Item -Force $backupPath $pgHba
}

& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' -D $pgData -l (Join-Path $pgData 'pg_reload.log') reload

$repoRoot = Split-Path -Parent $PSScriptRoot
$schemaFiles = @(
    (Join-Path $repoRoot 'db\schema.sql'),
    (Join-Path $repoRoot 'db\schema_phase2.sql'),
    (Join-Path $repoRoot 'db\schema_phase3_gis.sql'),
    (Join-Path $repoRoot 'db\schema_ai_processing.sql'),
    (Join-Path $repoRoot 'db\schema_phase4_security.sql')
)

foreach ($schemaFile in $schemaFiles) {
    if (Test-Path $schemaFile) {
        & $psql -U janseva -h localhost -d janseva -v ON_ERROR_STOP=1 -f $schemaFile
    }
}

Write-Host 'Local PostgreSQL is configured for janseva / janseva on localhost:5432.'
