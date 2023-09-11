import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, collection, getDocs, getDoc } from "firebase/firestore";
import Navbar from "../components/NavBarDash";
import { BiMailSend } from "react-icons/bi";

const Answers = () => {
  const { formId } = useParams();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAnswerId, setExpandedAnswerId] = useState(null);

  const contactCardKeys = [
    "first_name",
    "last_name",
    "occupation",
    "street",
    "house_number",
    "postal_code",
    "city",
    "phone",
    "email",
  ];
  const textareaKeys = ["OcrText", "STT", "text"];
  const websiteKey = "website";
  const excludeKeys = [
    ...contactCardKeys,
    ...textareaKeys,
    websiteKey,
    "parent_form",
    "id",
  ];

  const renderInputField = (key, value) => (
    <div key={key}>
      <label className="block text-gray-600 capitalize">
        {key.replace("_", " ")}
      </label>
      <input
        type="text"
        className="w-full p-2 border rounded shadow-sm focus:outline-none focus:border-blue-400"
        value={value}
        readOnly
      />
    </div>
  );

  const renderTextareaField = (key, value, rows = 3) => (
    <div key={key}>
      <label className="block text-gray-600 capitalize">
        {key.replace("_", " ")}
      </label>
      <textarea
        className="w-full p-2 border rounded shadow-sm focus:outline-none focus:border-blue-400"
        value={value}
        readOnly
        rows={rows}
      />
    </div>
  );

  const renderLinkField = (key, value) => (
    <div key={key}>
      <label className="block text-gray-600 capitalize">
        {key.replace("_", " ")}
      </label>
      <a href={value} target="_blank" rel="noopener noreferrer">
        {value}
      </a>
    </div>
  );

  const handleMailClick = (email) => {
    const subject = encodeURIComponent("Outreach Subject Dummy");
    const body = encodeURIComponent("Hey, we talked today and bla bla...");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const renderContactCardFields = (answer) => {
    const exists = contactCardKeys.some((key) => answer[key]);
    if (!exists) return null;

    return (
      <>
        <div className="bg-gray-200 p-4 rounded">
          <h3 className="text-gray-700 font-medium mb-4">Contact Card:</h3>
          {contactCardKeys.map((key) => {
            if (key === "email" && answer[key]) {
              return (
                <div key={key}>
                  <label className="block text-gray-600 capitalize">
                    {key.replace("_", " ")}
                  </label>
                  <div className="flex justify-between items-center">
                    <input
                      type="text"
                      className="w-full p-2 border rounded shadow-sm focus:outline-none focus:border-blue-400"
                      value={answer[key]}
                      readOnly
                    />
                    <button
                      onClick={() => handleMailClick(answer[key])}
                      className="ml-2 bg-green-500 text-white px-3 py-3 rounded focus:outline-none"
                    >
                      <BiMailSend />
                    </button>
                  </div>
                </div>
              );
            }
            return answer[key] ? renderInputField(key, answer[key]) : null;
          })}
        </div>
      </>
    );
  };

  const renderTextareaFields = (answer) => {
    const exists = textareaKeys.some((key) => answer[key]);
    if (!exists) return null;

    return (
      <>
        <h3 className="text-gray-700 font-medium mb-4">Textareas:</h3>
        {textareaKeys.map((key) => {
          return answer[key] ? renderTextareaField(key, answer[key]) : null;
        })}
      </>
    );
  };

  const renderWebsiteField = (answer) => {
    if (!answer[websiteKey]) return null;

    return (
      <>
        <h3 className="text-gray-700 font-medium mb-4">Website:</h3>
        {renderLinkField(websiteKey, answer[websiteKey])}
      </>
    );
  };

  const renderRemainingFields = (answer) => {
    const remainingFields = Object.entries(answer).filter(
      ([key]) => !excludeKeys.includes(key)
    );
    if (remainingFields.length === 0) return null;

    return (
      <>
        <h3 className="text-gray-700 font-medium mb-4">The rest:</h3>
        {remainingFields.map(([key, value]) =>
          renderTextareaField(key, value, 1)
        )}
      </>
    );
  };

  useEffect(() => {
    const fetchFormDetails = async () => {
      try {
        const formDoc = await getDoc(
          doc(db, "users", auth.currentUser.uid, "forms", formId)
        );
        const formData = formDoc.data();

        if (formData && formData.allowed.includes(auth.currentUser.email)) {
          const submitto = formData.submitto;
          const answerDocs = await getDocs(
            collection(db, "users", submitto.parent_id, "answers")
          );
          const relevantAnswers = answerDocs.docs.filter(
            (doc) => doc.data().parent_form === submitto.form_id
          );

          setAnswers(
            relevantAnswers.map((doc) => ({ id: doc.id, ...doc.data() }))
          );
        }
      } catch (error) {
        console.error("Error fetching form details or answers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormDetails();
  }, [formId]);

  const handleAnswerClick = (id) => {
    if (expandedAnswerId === id) {
      setExpandedAnswerId(null);
    } else {
      setExpandedAnswerId(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-pink-100 p-4 md:p-6">
      <Navbar />
      <div className="max-w-5xl mx-auto space-y-6 shadow-md p-6 rounded-md bg-white">
        <p className="mb-6 text-gray-700 font-semibold">Form ID: {formId}</p>
        <p className="mb-6 text-gray-500">
          Viewing answers as: {auth.currentUser.email}
        </p>

        {loading && <p className="text-gray-500">Loading answers...</p>}

        {!loading &&
          answers.map((answer) => (
            <div
              key={answer.id}
              className="p-4 rounded shadow mb-4 border bg-gray-100"
            >
              <div
                className="flex flex-wrap justify-between items-center cursor-pointer"
                onClick={() => handleAnswerClick(answer.id)}
              >
                <div className="flex-1 mb-2 md:mb-0">
                  <p className="text-gray-800 font-medium">
                    Answer from Form: {answer.id || "Anonymous"}
                  </p>
                </div>
                <div>
                  {expandedAnswerId === answer.id ? (
                    <button className="bg-red-500 text-white px-3 py-1 rounded focus:outline-none">
                      Close
                    </button>
                  ) : (
                    <button className="bg-blue-500 text-white px-3 py-1 rounded focus:outline-none">
                      View
                    </button>
                  )}
                </div>
              </div>
              {expandedAnswerId === answer.id && (
                <div className="mt-4 space-y-4">
                  {renderContactCardFields(answer)}
                  {renderTextareaFields(answer)}
                  {renderWebsiteField(answer)}
                  {renderRemainingFields(answer)}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Answers;
