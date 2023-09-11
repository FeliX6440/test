import React, { useState } from "react";
import "../index.css";
import { BsArrowDownRightSquare, BsFolderPlus } from "react-icons/bs";
import { auth } from "../firebase";

const BACKEND_URL = "https://purplehunter.pythonanywhere.com";
const OCR_ENDPOINT = `${BACKEND_URL}/ocr`;

const OcrTextbox = ({ onTextChange }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [language, setLanguage] = useState("eng");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleOCR = async () => {
    event.preventDefault();
    if (!imageSrc) return;

    setOcrProgress(20);

    const body = {
      imageData: imageSrc.split(",")[1],
      languageHint: language,
    };

    try {
      const response = await fetch(OCR_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        user: auth.currentUser.uid,
      });

      const data = await response.json();

      if (data?.result) {
        setOcrText(data.result);
        onTextChange(data.result);
        setOcrProgress(100);
      } else {
        setOcrProgress(0);
      }
    } catch (error) {
      setOcrProgress(0);
    }
  };

  return (
    <div className="relative p-4 rounded shadow mb-4 border bg-white">
      <label className="block text-gray-700 mb-2">Upload an Image:</label>

      {imageSrc && (
        <div className="mb-4">
          <img
            src={imageSrc}
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
          id="imageUpload1"
        />
        <label htmlFor="imageUpload1" className="cursor-pointer">
          <BsFolderPlus />
        </label>
        <button onClick={handleOCR} className="btn-upload">
          <BsArrowDownRightSquare />
        </button>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="cursor-pointer bg-white border rounded p-1"
        >
          <option value="eng">English</option>
          <option value="deu">German</option>
          <option value="fra">French</option>
          <option value="ita">Italian</option>
        </select>
      </div>

      {ocrProgress > 0 && ocrProgress < 100 && (
        <div className="mt-4">
          <div className="h-2 mb-4 text-xs flex rounded bg-green-200">
            <div
              style={{ width: `${ocrProgress}%` }}
              className="h-full rounded bg-green-500"
            ></div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <textarea
          value={ocrText}
          onChange={(e) => {
            setOcrText(e.target.value);
            onTextChange(e.target.value);
          }}
          rows="6"
          className="w-full p-2 border rounded shadow-sm focus:outline-none focus:border-blue-400 resize-none"
          placeholder="Extracted text will appear here..."
        />
      </div>
    </div>
  );
};

export default OcrTextbox;
