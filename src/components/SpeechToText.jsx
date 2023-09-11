import { useState } from "react";
import OpenAI from "openai";
import { FaMicrophone, FaSpinner } from "react-icons/fa";
import { SiGoogletranslate } from "react-icons/si";
import { AiOutlineThunderbolt } from "react-icons/ai";
import "../index.css";
import RecordRTC from "recordrtc";

export default function Transcriber({ setSTTText }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [text, setText] = useState("");
  const [CurrentLang, SetCurrentLang] = useState("english");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "https://purplehunter.pythonanywhere.com";
  const STT_ENDPOINT = `${BACKEND_URL}/stt-v2-turbo`;
  const TRANSLATE_ENDPOINT = `${BACKEND_URL}/translate`;
  const SUMMARIZE_ENDPOINT = `${BACKEND_URL}/summarize`;

  async function startRecording(e) {
    e.preventDefault();
    if (
      typeof navigator.mediaDevices === "undefined" ||
      !navigator.mediaDevices.getUserMedia
    ) {
      alert(
        "Your OS Currently Blocks this feature... please use your Phones speech-to-text system to write in this field... the other features should still be working fine"
      );
      return;
    }

    if (!recording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recordRTC = RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
      });
      const recorder = new MediaRecorder(stream);
      let audioChunks = [];

      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      recorder.onstop = async () => {
        setLoading(true);
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" }); // Modified this line

        const response = await fetch(STT_ENDPOINT, {
          method: "POST",
          body: audioBlob,
          headers: {
            "Content-Type": "audio/wav", // Modified this line
          },
        });

        const result = await response.json();
        setLoading(false);

        console.log(result);
        setText(result.text);
        setSTTText(result.text);
      };

      recorder.start();
      setRecording(true);
      setMediaRecorder(recorder);
    } else if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
  }

  async function translate(e) {
    setLoading(true);
    e.preventDefault();

    const response = await fetch(TRANSLATE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        lang: CurrentLang,
      }),
    });

    const result = await response.json();
    setLoading(false);

    setText(result.text);
    setSTTText(result.text);
  }

  async function summarize(e) {
    setLoading(true);
    e.preventDefault();

    const response = await fetch(SUMMARIZE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    const result = await response.json();
    setLoading(false);

    setText(result.text);
    setSTTText(result.text);
  }

  return (
    <div className="relative p-4 rounded shadow mb-4 border bg-gray-100">
      <div className="relative w-full">
        <textarea
          className="w-full p-2 border rounded shadow-sm focus:outline-none focus:border-blue-200 mb-4"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSTTText(e.target.value);
          }}
          placeholder="Transcription text..."
          rows={5}
        ></textarea>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <FaSpinner className="animate-spin" size={24} />
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 mb-4">
        <button
          className={`flex items-center justify-center btn-upload px-4 py-2 text-white rounded shadow-sm hover:bg-green-300 w-full md:w-auto mt-2 ${
            recording ? "button-recording" : "button-not-recording"
          }`}
          onClick={startRecording}
        >
          <FaMicrophone size={20} />
        </button>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={CurrentLang}
            onChange={(e) => SetCurrentLang(e.target.value)}
            className="cursor-pointer bg-gray-200 rounded p-2"
          >
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
            <option value="german">German</option>
          </select>
          <button
            className="flex items-center justify-center btn-upload px-4 py-2 bg-gray-500 text-white rounded shadow-sm hover:bg-green-300 w-full md:w-auto"
            onClick={translate}
          >
            <SiGoogletranslate size={20} />
          </button>
        </div>
        <button
          className="flex items-center justify-center btn-upload px-4 py-2 bg-pink-200 text-white rounded shadow-sm hover:bg-yellow-300 w-full md:w-auto mt-2"
          onClick={summarize}
        >
          <AiOutlineThunderbolt size={20} />
        </button>
      </div>
    </div>
  );
}
