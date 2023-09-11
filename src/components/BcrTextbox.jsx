import React, { useState } from "react";
import "../index.css";
import { BsArrowDownRightSquare, BsFolderPlus } from "react-icons/bs";
import OpenAI from "openai";
import { auth } from "../firebase";

const BACKEND_ENDPOINT = "https://purplehunter.pythonanywhere.com/decrypt-bcr";

const BcrTextbox = (props) => {
  const [imageSrc1, setImageSrc1] = useState(null);
  const [ocrText1, setOcrText1] = useState("");
  const [ocrProgress1, setOcrProgress1] = useState(0);
  const [language1, setLanguage1] = useState("eng");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc1(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleOCR = async (event) => {
    event.preventDefault();
    if (!imageSrc1) return;

    setOcrProgress1(20);

    try {
      const response = await fetch(BACKEND_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          imageData: imageSrc1.split(",")[1],
          languageHint: language1,
          user: auth.currentUser.uid,
        }),
      });

      const data = await response.json();

      if (data?.result) {
        setOcrText1(data.result);
        if (props.onDataExtracted) {
          props.onDataExtracted(data.result);
        }
        setOcrProgress1(100);
      } else {
        setOcrProgress1(0);
      }
    } catch (error) {
      console.error("Error during OCR processing:", error);
      setOcrProgress1(0);
    }
  };

  return (
    <div className="relative p-4 rounded shadow mb-4 border bg-gray-100">
      <label className="block text-gray-700 mb-2">Upload an Image:</label>
      {imageSrc1 && (
        <div className="mb-4">
          <img
            src={imageSrc1}
            alt="Uploaded preview"
            className="rounded max-w-[150px] md:max-w-[300px] mx-auto"
          />
        </div>
      )}

      <div className="flex justify-between items-center md:space-x-2 space-y-2 md:space-y-0">
        <input
          type="file"
          onChange={handleImageUpload}
          className="hidden"
          id="imageUpload"
        />
        <label htmlFor="imageUpload" className="cursor-pointer">
          <BsFolderPlus />
        </label>
        <button onClick={handleOCR} className="btn-upload">
          <BsArrowDownRightSquare />
        </button>
        <select
          value={language1}
          onChange={(e) => setLanguage1(e.target.value)}
          className="cursor-pointer bg-gray-100"
        >
          <option value="eng">English</option>
          <option value="deu">German</option>
          <option value="fra">French</option>
          <option value="ita">Italian</option>
        </select>
      </div>

      {ocrProgress1 > 0 && ocrProgress1 < 100 && (
        <div className="mt-4">
          <div className="h-2 mb-4 text-xs flex rounded bg-green-200">
            <div
              style={{ width: `${ocrProgress1}%` }}
              className="h-full bg-green-500"
            ></div>
          </div>
        </div>
      )}

      {ocrText1?.data &&
        Object.keys(ocrText1.data).map((key) => (
          <div key={key} className="mt-2">
            <label className="block text-gray-700 mb-2 capitalize">{key}</label>
            <input
              className="w-full p-2 border rounded shadow-sm focus:outline-none focus:border-blue-400"
              type="text"
              value={ocrText1.data[key]}
              onChange={(e) =>
                setOcrText1((prevState) => {
                  return {
                    ...prevState,
                    data: { ...prevState.data, [key]: e.target.value },
                  };
                })
              }
            />
          </div>
        ))}
    </div>
  );
};

export default BcrTextbox;
