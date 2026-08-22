import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SubmitComplaint() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        location: "",
    });

    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleImageChange = (event) => {
        setImage(event.target.files[0]);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const nextErrors = {};
        if (formData.title.trim().length < 5) nextErrors.title = "Enter a title with at least 5 characters.";
        if (formData.description.trim().length < 20) nextErrors.description = "Describe the issue in at least 20 characters.";
        if (!formData.category) nextErrors.category = "Select a category.";
        if (formData.location.trim().length < 3) nextErrors.location = "Enter a useful location.";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }

        const complaintData = {
            ...formData,
            image: image,
        };

        console.log("Complaint Data:", complaintData);

        navigate("/preview", {
            state: complaintData,
        });
    };

    return (
        <div className="complaint-page">

            <h1>Submit a Complaint</h1>

            <p>
                Report a civic issue and provide the necessary details.
            </p>

            <form onSubmit={handleSubmit}>

                {/* Title */}

                <div>
                    <label htmlFor="title">Complaint Title <span className="required">Required</span></label>

                    <input
                        id="title"
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Example: Pothole on Main Road"
                        aria-invalid={Boolean(errors.title)}
                    />
                    {errors.title && <p className="error-message">{errors.title}</p>}
                </div>


                {/* Description */}

                <div>
                    <label htmlFor="description">Complaint Description <span className="required">Required</span></label>

                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the problem..."
                        rows="5"
                        aria-invalid={Boolean(errors.description)}
                    />
                    <span className="field-help">Share what happened, where, and when. {formData.description.length}/1000</span>
                    {errors.description && <p className="error-message">{errors.description}</p>}
                </div>


                {/* Category */}

                <div>
                    <label htmlFor="category">Category</label>

                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    >

                        <option value="">
                            Select Category
                        </option>

                        <option value="Road">
                            Road
                        </option>

                        <option value="Water Supply">
                            Water Supply
                        </option>

                        <option value="Garbage">
                            Garbage
                        </option>

                        <option value="Streetlight">
                            Streetlight
                        </option>

                        <option value="Drainage">
                            Drainage
                        </option>

                        <option value="Other">
                            Other
                        </option>

                    </select>
                    {errors.category && <p className="error-message">{errors.category}</p>}
                </div>


                {/* Location */}

                <div>
                    <label htmlFor="location">Location</label>

                    <input
                        id="location"
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter complaint location"
                        aria-invalid={Boolean(errors.location)}
                    />
                    {errors.location && <p className="error-message">{errors.location}</p>}
                </div>


                {/* Image */}

                <div>
                    <label>Upload Image (Optional)</label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>


                {/* Submit */}

                <button type="submit">
                    Review Complaint
                </button>

            </form>

        </div>
    );
}

export default SubmitComplaint;