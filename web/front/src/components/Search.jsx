import { useState } from 'react';

export default function Search(props) {
    const initFormData = {
        "sortBy": "",
        "games.free =": "",
        "games.offers_iap =": "",
        "games.ad_supported =": "",
        "games.android_version <=": "",
        "games.max_installs <=": "",
        "games.max_installs >=": "",
        "games.score <=": "",
        "games.score >=": "",
        "games.price <=": "",
        "games.price >=": "",
        "games.ratings <=": "",
        "games.ratings >=": "",
        "games.reviews <=": "",
        "games.reviews >=": "",
        "games.updated <=": "",
        "games.updated >=": "",
        "games.released <=": "",
        "games.released >=": "",
        "genres.genre IN": "",
        "oneOfTags": "",
        "allOfTags": ""
    };

    const [formData, setFormData] = useState(initFormData);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function handleReset() {
        setFormData(initFormData);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        for (const k in formData) {
            if (typeof formData[k] === "string") {
                formData[k] = formData[k].trim();
            }
        }
        const params = new URLSearchParams(formData).toString();

        try {
            const res = await fetch(`/api?${params}`, {
                method: "GET"
            });

            if (!res.ok) {
                throw new Error("Request failed");
            }

            const data = await res.json();

            props.setData(data);

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <button type="button" onClick={handleReset}>
                Reset
            </button>

            <label>Sort By:</label>
            <select
                name="sortBy"
                value={formData["sortBy"]}
                onChange={handleChange}
            >
                <option value="games.max_installs DESC">Installs (High to Low)</option>
                <option value="games.max_installs ASC">Installs (Low to High)</option>
                <option value="games.score DESC">Score (High to Low)</option>
                <option value="games.score ASC">Score (Low to High)</option>
                <option value="games.ratings DESC">Amount of Ratings (High to Low)</option>
                <option value="games.ratings ASC">Amount of Ratings (Low to High)</option>
                <option value="games.reviews DESC">Amount of Reviews (High to Low)</option>
                <option value="games.reviews ASC">Amount of Reviews (Low to High)</option>
                <option value="games.price DESC">Price (High to Low)</option>
                <option value="games.price ASC">Price (Low to High)</option>
                <option value="games.android_version DESC">Minimum android version required (High to Low)</option>
                <option value="games.android_version ASC">Minimum android version required (Low to High)</option>
                <option value="games.updated DESC">Latest update (Newest first)</option>
                <option value="games.updated ASC">Latest update (Oldest first)</option>
                <option value="games.released DESC">Released Date (Newest first)</option>
                <option value="games.released ASC">Released Date (Oldest first)</option>
            </select>

            <InputFieldAYN
                legend="Free to download:"
                name="games.free ="
                form={formData["games.free ="]}
                onChange={handleChange}
            />
            <InputFieldAYN
                legend="Contains in app purchases:"
                name="games.offers_iap ="
                form={formData["games.offers_iap ="]}
                onChange={handleChange}
            />
            <InputFieldAYN
                legend="Contains ads:"
                name="games.ad_supported ="
                form={formData["games.ad_supported ="]}
                onChange={handleChange}
            />

            <label>Minimum android version required:</label>
            <input
                type="number"
                name="games.android_version <="
                value={formData["games.android_version <="]}
                onChange={handleChange}
            />

            <label>Min Installs:</label>
            <input
                type="number"
                name="games.max_installs >="
                value={formData["games.max_installs >="]}
                onChange={handleChange}
            />

            <label>Max Installs:</label>
            <input
                type="number"
                name="games.max_installs <="
                value={formData["games.max_installs <="]}
                onChange={handleChange}
            />

            <label>Min Score:</label>
            <input
                type="number"
                name="games.score >="
                value={formData["games.score >="]}
                onChange={handleChange}
            />

            <label>Max Score:</label>
            <input
                type="number"
                name="games.score <="
                value={formData["games.score <="]}
                onChange={handleChange}
            />

            <label>Min Price:</label>
            <input
                type="number"
                name="games.price >="
                value={formData["games.price >="]}
                onChange={handleChange}
            />

            <label>Max Price:</label>
            <input
                type="number"
                name="games.price <="
                value={formData["games.price <="]}
                onChange={handleChange}
            />

            <label>Min Amount of Ratings:</label>
            <input
                type="number"
                name="games.ratings >="
                value={formData["games.ratings >="]}
                onChange={handleChange}
            />

            <label>Max Amount of Ratings:</label>
            <input
                type="number"
                name="games.ratings <="
                value={formData["games.ratings <="]}
                onChange={handleChange}
            />

            <label>Min Amount of Reviews:</label>
            <input
                type="number"
                name="games.reviews >="
                value={formData["games.reviews >="]}
                onChange={handleChange}
            />

            <label>Max Amount of Reviews:</label>
            <input
                type="number"
                name="games.reviews <="
                value={formData["games.reviews <="]}
                onChange={handleChange}
            />

            <label>Latest Update After:</label>
            <input
                type="date"
                name="games.updated >="
                value={formData["games.updated >="]}
                onChange={handleChange}
            />

            <label>Latest Update Before:</label>
            <input
                type="date"
                name="games.updated <="
                value={formData["games.updated <="]}
                onChange={handleChange}
            />

            <label>Released After:</label>
            <input
                type="date"
                name="games.released >="
                value={formData["games.released >="]}
                onChange={handleChange}
            />

            <label>Released Before:</label>
            <input
                type="date"
                name="games.released <="
                value={formData["games.released <="]}
                onChange={handleChange}
            />

            <label>Genres (use , for multiple input):</label>
            <input
                type="text"
                name="genres.genre IN"
                value={formData["genres.genre IN"]}
                onChange={handleChange}
            />

            <label>Tags (use , for multiple input): Contains atleast on of the following tags:</label>
            <input
                type="text"
                name="oneOfTags"
                value={formData["oneOfTags"]}
                onChange={handleChange}
            />

            <label>Tags (use , for multiple input): Contains every one of the following tags:</label>
            <input
                type="text"
                name="allOfTags"
                value={formData["allOfTags"]}
                onChange={handleChange}
            />

            <button type="submit">Search</button>
        </form>
    );
}

function InputFieldAYN(props) {
    return (
        <fieldset>
            <legend>{props.legend}</legend>
            <label>
                <input
                    type="radio"
                    name={props.name}
                    value=""
                    checked={props.form === ""}
                    onChange={props.onChange}
                />
                All
            </label>
            <label>
                <input
                    type="radio"
                    name={props.name}
                    value="true"
                    checked={props.form === "true"}
                    onChange={props.onChange}
                />
                Yes
            </label>
            <label>
                <input
                    type="radio"
                    name={props.name}
                    value="false"
                    checked={props.form === "false"}
                    onChange={props.onChange}
                />
                No
            </label>
        </fieldset>
    );
}
