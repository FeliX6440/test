import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import "../index.css";
import OcrTextbox from "../components/OcrTextbox";
import BcrTextbox from "../components/BcrTextbox";
import SpeechToText from "../components/SpeechToText";
import Select from "react-select";
import { darken } from "polished";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBarDash";
import { BsShare } from "react-icons/bs";

const MainDash = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [dropdownSelection, setDropdownSelection] = useState("text");
  const [customField, setCustomField] = useState("");
  const [formName, setFormName] = useState("New Form");
  const [error, setError] = useState("");
  const [formResponses, setFormResponses] = useState({});
  const [OcrText, setOcrText] = useState("");
  const [BcrText, setBcrText] = useState("");
  const navigate = useNavigate();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const renderShareDialog = () => {
    return (
      <div className="max-w-md mx-auto p-4">
        <input
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-300 placeholder-gray-400"
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
          placeholder="Enter email to share with"
        />
        <button
          onClick={shareForm}
          className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-cyan-200 to-blue-200 text-black font-bold rounded focus:outline-none hover:from-cyan-300 hover:to-blue-300 hover:text-white"
        >
          Share Form
        </button>
      </div>
    );
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const shareForm = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.error("User not authenticated");
      setError("Authentication error.");
      return;
    }

    // Fetch all users
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    let targetUserDoc = null;

    // Manually iterate to find the user with the matching email
    querySnapshot.forEach((doc) => {
      if (doc.data().email === shareEmail) {
        targetUserDoc = doc;
      }
    });

    if (!targetUserDoc) {
      setError("No matching user found.");
      return;
    }

    if (selectedForm && selectedForm.id) {
      // Use the allowed list from selectedForm as the initial list
      let allowedEmails = selectedForm.allowed || [];

      if (!allowedEmails.includes(shareEmail)) {
        // Avoid duplicates
        allowedEmails.push(shareEmail);
      }

      // Step 1: Get the reference to the form
      const formRef = doc(db, "users", uid, "forms", selectedForm.id);

      // Step 2: Update the form in the database with the modified 'allowed' list
      await updateDoc(formRef, {
        allowed: allowedEmails,
      });

      const formClone = {
        ...selectedForm,
        submitto: {
          form_id: selectedForm.id,
          parent_id: uid,
        },
        allowed: allowedEmails, // Set the updated allowed list
      };

      setShowShareDialog(false);

      // Update (or set) the cloned form in the target user's database
      await setDoc(
        doc(
          collection(doc(db, "users", targetUserDoc.id), "forms"),
          selectedForm.id
        ),
        formClone
      );
    }
  };

  const goToAnswers = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.error("User not authenticated");
      setError("Authentication error.");
      return;
    }

    if (selectedForm && selectedForm.id) {
      try {
        const formDocRef = doc(
          collection(doc(db, "users", uid), "forms"),
          selectedForm.id
        );
        const formSnap = await getDoc(formDocRef);

        if (formSnap.exists()) {
          // Since we are fetching the form from the path containing the user's ID,
          // the existence of the form at this path is enough to confirm ownership.
          navigate(`/answers/${selectedForm.id}`);
        } else {
          setError("You don't have permission to access this form.");
        }
      } catch (error) {
        console.error("Error accessing form: ", error);
        setError(error.message);
      }
    } else {
      setError("No form selected.");
    }
  };

  const options_leads = [
    { value: "Burning", label: "Burning", color: "#F4D1E7" },
    { value: "Hot", label: "Hot", color: "#F8E7F2" },
    { value: "Cold", label: "Cold", color: "#BCD0EE" },
    { value: "Freezing", label: "Freezing", color: "#B6F0FA" },
  ];

  const flattenObject = (obj, parentKey = "", result = {}) => {
    for (let key in obj) {
      let newKey = parentKey ? `${parentKey}_${key}` : key;
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        flattenObject(obj[key], newKey, result);
      } else {
        result[newKey] = obj[key];
      }
    }
    return result;
  };

  const handleOcrChange = (text) => {
    setOcrText(text);
    setFormResponses((prev) => ({ ...prev, OcrText: text }));
  };

  const handleSTTChange = (text) => {
    setOcrText(text);
    setFormResponses((prev) => ({ ...prev, STT: text }));
  };

  const handleBcrChange = (text) => {
    const flattenedData = flattenObject(text.data);
    setBcrText(text);
    setFormResponses((prev) => ({
      ...prev,
      ...flattenedData,
    }));
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? darken(0.1, state.data.color) // darkens the color a bit when focused
        : state.data.color,
      color: "black",
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: "black",
    }),
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state.hasValue ? state.getValue()[0].color : "#fff",
      borderColor: state.isFocused ? "#A5ACB3" : "#ccc", // Adjust border colors if needed
      boxShadow: state.isFocused ? "0 3px 10px rgba(0, 0, 0, 0.15)" : null, // Optional
      "&:hover": {
        borderColor: state.isFocused ? "#A5ACB3" : "#ccc", // Adjust border colors on hover
      },
    }),
  };

  const deleteFormFromDB = async (formId) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.error("User not authenticated");
        return;
      }

      const formRef = doc(db, "users", uid, "forms", formId);
      await deleteDoc(formRef);

      // Refresh forms
      fetchForms();
    } catch (error) {
      console.error("Error deleting form: ", error);
    }
  };

  const saveFormToDB = async () => {
    if (formName === "New Form" || formName === "") {
      setError("Please provide a unique name for your form.");
    } else {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          console.error("User not authenticated");
          setError("Authentication error.");
          return;
        }

        const formsRef = collection(doc(db, "users", uid), "forms");
        // Step 1: Get a new document reference with an auto-generated ID.
        const newFormRef = doc(formsRef);

        const newForm = {
          name: formName,
          fields: formFields,
          submitto: {
            form_id: newFormRef.id, // Step 2: Use the auto-generated ID.
            parent_id: uid,
          },
          allowed: [auth.currentUser.email],
        };

        // Step 3: Use the document reference to set the data.
        await setDoc(newFormRef, newForm);

        fetchForms();
        setError(""); // Clear any errors if save was successful
      } catch (error) {
        console.error("Error saving form: ", error);
        setError(error.message);
      }
    }
  };

  const fetchForms = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        console.error("User not authenticated");
        return;
      }

      const formsRef = collection(doc(db, "users", uid), "forms");
      const snapshot = await getDocs(formsRef);

      const formsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setForms(formsList);
    } catch (error) {
      console.error("Error fetching forms: ", error);
    } finally {
      setLoading(false);
    }
  };

  const openFormDialog = (form) => {
    setSelectedForm(form);
    setShowFormDialog(true);
  };

  const handleAddField = () => {
    if (dropdownSelection === "custom") {
      setFormFields([...formFields, customField]);
      setCustomField(""); // Reset custom input field after adding
    } else {
      setFormFields([...formFields, dropdownSelection]);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const logitem = (e) => {
    e.preventDefault();
    console.log(formResponses);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.error("User not authenticated");
      return;
    }

    try {
      const answersRef = collection(
        doc(db, "users", selectedForm.submitto.parent_id),
        "answers"
      );
      formResponses["parent_form"] = selectedForm.submitto.form_id;
      await setDoc(doc(answersRef), formResponses);
      console.log("Responses saved successfully.");
      setShowFormDialog(false);
    } catch (error) {
      console.error("Error saving responses: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-pink-100 p-4 md:p-6">
      <Navbar />
      <div className="max-w-5xl mx-auto space-y-6 shadow-md p-6 rounded-md bg-white">
        <p className="mb-6 text-gray-700 font-semibold">
          Currently logged in: {auth.currentUser?.email}
          <button
            onClick={logout}
            className="w-full py-2 px-4 mt-4 bg-gradient-to-r from-red-200 to-pink-200 text-black font-bold rounded focus:outline-none hover:from-red-300 hover:to-pink-300 hover:text-white"
          >
            Logout
          </button>
        </p>
        <button
          onClick={() => setShowFormBuilder(true)}
          className="w-full py-2 px-4 bg-gradient-to-r from-cyan-200 to-blue-200 text-black font-bold rounded focus:outline-none hover:from-cyan-300 hover:to-blue-300 hover:text-white"
        >
          + Add New Form
        </button>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">My Forms</h2>
            {forms.length > 0 ? (
              forms.map((form) => (
                <div
                  key={form.id}
                  className="p-4 rounded shadow mb-4 border bg-gray-100"
                >
                  <div className="flex flex-wrap justify-between items-center">
                    <div className="flex-1 mb-2 md:mb-0">
                      <p className="text-gray-800 font-medium">{form.name}</p>
                      <p className="text-gray-600 text-sm mt-1">
                        ID: {form.id}
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => openFormDialog(form)}
                        className="mr-2 bg-blue-200 text-black rounded-full py-1 px-3 hover:bg-blue-300 focus:outline-none"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => deleteFormFromDB(form.id)}
                        className="bg-pink-200 text-black rounded-full py-1 px-3 hover:bg-pink-300 focus:outline-none"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No forms available</p>
            )}
          </div>
        )}
        {showFormDialog && selectedForm?.fields && (
          <div className="mt-4 space-y-4">
            <div>
              {showShareDialog && renderShareDialog()}
              <button onClick={() => setShowShareDialog(true)}>
                <BsShare />
              </button>
            </div>
            <button
              onClick={goToAnswers}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-300 to-cyan-200 text-black font-bold rounded focus:outline-none hover:from-blue-400 hover:to-cyan-300 hover:text-white"
            >
              Go to Answers
            </button>
            <form className="mt-4 space-y-4">
              {Object.keys(selectedForm.fields).map((key) => (
                <div key={key} className="mb-4">
                  <label className="block text-gray-700 mb-2 capitalize">
                    {selectedForm.fields[key]}
                  </label>
                  {selectedForm.fields[key] === "Transcript OCR" ? (
                    <OcrTextbox onTextChange={handleOcrChange} />
                  ) : selectedForm.fields[key] === "Business Card Scanner" ? (
                    <BcrTextbox onDataExtracted={handleBcrChange} />
                  ) : selectedForm.fields[key] === "Audio Transcription" ? (
                    <SpeechToText setSTTText={handleSTTChange} />
                  ) : selectedForm.fields[key] === "Lead Temperature" ? (
                    <Select
                      options={options_leads}
                      styles={customStyles}
                      onChange={(option) =>
                        setFormResponses((prev) => ({
                          ...prev,
                          [selectedForm.fields[key]]: option.value,
                        }))
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      name={key}
                      className="w-full p-2 border rounded shadow-sm focus:outline-none focus:border-blue-400"
                      onChange={(e) =>
                        setFormResponses((prev) => ({
                          ...prev,
                          [selectedForm.fields[key]]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
              <button
                className="w-full py-2 px-4 bg-gradient-to-r from-cyan-200 to-blue-200 text-black font-bold rounded focus:outline-none hover:from-cyan-300 hover:to-blue-300 hover:text-white"
                onClick={handleSubmitForm}
              >
                Submit
              </button>
            </form>
            <button
              onClick={() => setShowFormDialog(false)}
              className="w-full py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
            >
              Close
            </button>
          </div>
        )}
        {showFormBuilder && (
          <div className="mt-4 space-y-4">
            <input
              type="text"
              value={formName}
              placeholder="Enter form name"
              onChange={(e) => setFormName(e.target.value)}
              className="w-full p-2 mb-4 border rounded shadow-sm focus:outline-none focus:border-blue-400"
            />
            {error && <p className="text-red-500">{error}</p>}{" "}
            <select
              value={dropdownSelection}
              onChange={(e) => setDropdownSelection(e.target.value)}
              className="w-full p-2 border rounded shadow-sm focus:outline-none focus:border-blue-400"
            >
              <option value="Business Card Scanner">
                Business Card Reader
              </option>
              <option value="Audio Transcription">Audio - Text</option>
              <option value="Transcript OCR">Transcript OCR</option>
              <option value="text">Base Text</option>
              <option value="Lead Temperature">Lead Temperature</option>
              <option value="custom">Custom</option>
            </select>
            {dropdownSelection === "custom" && (
              <input
                type="text"
                value={customField}
                placeholder="Enter custom field"
                onChange={(e) => setCustomField(e.target.value)}
                className="w-full p-2 border rounded shadow-sm focus:outline-none focus:border-blue-400"
              />
            )}
            <button
              onClick={handleAddField}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-300 to-cyan-200 text-black font-bold rounded focus:outline-none hover:from-blue-400 hover:to-cyan-300 hover:text-white"
            >
              Add Field
            </button>
            {formFields.map((field, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-100 p-2 rounded shadow"
              >
                <span className="text-gray-700">{field}</span>
                <button
                  onClick={() => {
                    const updatedFields = [...formFields];
                    updatedFields.splice(index, 1);
                    setFormFields(updatedFields);
                  }}
                  className="text-pink-300 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                if (formName !== "New Form") {
                  console.log(error);
                  setShowFormBuilder(false);
                  setFormFields([]);
                  setDropdownSelection("");
                  saveFormToDB();
                }
                {
                  setError("Please choose another Name for the form");
                }
              }}
              className="w-full py-2 px-4 bg-gradient-to-r from-cyan-200 to-blue-200 text-black font-bold rounded focus:outline-none hover:from-cyan-300 hover:to-blue-300 hover:text-white"
            >
              Save and Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainDash;
