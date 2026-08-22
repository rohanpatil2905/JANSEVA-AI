import { Link } from "react-router-dom";

function Footer() {
	return (
		<footer className="site-footer">
			<div>
				<Link className="brand footer-brand" to="/">
					<span className="brand-mark">JS</span>
					<span><strong>JanSeva AI</strong><small>Better civic services, together.</small></span>
				</Link>
				<p>Making everyday civic reporting clearer, more accessible, and accountable.</p>
			</div>
			<div className="footer-links"><Link to="/language">Language</Link><Link to="/login">Citizen login</Link></div>
		</footer>
	);
}

export default Footer;
