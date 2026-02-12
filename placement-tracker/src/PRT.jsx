// import { useState, useEffect } from "react";

// /* ---------- WEEK NUMBER FUNCTION ---------- */
// function getWeekNumber() {
//   const now = new Date();
//   const start = new Date(now.getFullYear(), 0, 1);

//   const diff =
//     now - start +
//     (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;

//   const oneWeek = 604800000; // ms in one week
//   return Math.floor(diff / oneWeek);
// }

// function PRT() {
//   /* ---------- STATE ---------- */

//   const [weeklyGoal, setWeeklyGoal] = useState(() => {
//     const saved = localStorage.getItem("weeklyGoal");
//     return saved ? parseInt(saved) : 0;
//   });

//   const [completed, setCompleted] = useState(() => {
//     const saved = localStorage.getItem("completed");
//     return saved ? parseInt(saved) : 0;
//   });

//   const [savedWeek, setSavedWeek] = useState(() => {
//     const storedWeek = localStorage.getItem("weekNumber");
//     return storedWeek ? parseInt(storedWeek) : getWeekNumber();
//   });

//   const [goalInput, setGoalInput] = useState("");
//   const [solvedInput, setSolvedInput] = useState("");

//   /* ---------- WEEK RESET EFFECT ---------- */
//   useEffect(() => {
//     const currentWeek = getWeekNumber();

//     if (savedWeek !== currentWeek) {
//       setCompleted(0);
//       localStorage.setItem("completed", 0);
//       localStorage.setItem("weekNumber", currentWeek);
//       setSavedWeek(currentWeek);
//     }
//   }, [savedWeek]);

//   /* ---------- SAVE TO LOCALSTORAGE ---------- */
//   useEffect(() => {
//     localStorage.setItem("weeklyGoal", weeklyGoal);
//     localStorage.setItem("completed", completed);
//   }, [weeklyGoal, completed]);

//   /* ---------- HANDLERS ---------- */

//   const handleSetGoal = () => {
//     const goal = parseInt(goalInput);
//     if (!goal || goal <= 0) return;

//     setWeeklyGoal(goal);
//     setCompleted(0);
//     setGoalInput("");
//   };

//   const handleAddSolved = () => {
//   if (!weeklyGoal) {
//     alert("Set weekly goal first!");
//     return;
//   }

//   const value = parseInt(solvedInput);
//   if (!value || value <= 0) return;

//   const newCompleted = completed + value;

//   setCompleted(newCompleted);
//   setSolvedInput("");

//   if (newCompleted >= weeklyGoal) {
//     alert("🎉 Weekly Goal Completed!");
//   }
// };

//   const handleReset = () => {
//   setCompleted(0);
//   localStorage.setItem("completed", 0);
// };

//   /* ---------- CALCULATIONS ---------- */

//   const percentage = weeklyGoal
//     ? (completed / weeklyGoal) * 100
//     : 0;

//   let status = "";
//   let color = "";

//   if (percentage < 40) {
//     status = "Lagging Behind";
//     color = "red";
//   } else if (percentage < 80) {
//     status = "Keep Pushing";
//     color = "orange";
//   } else {
//     status = "On Track";
//     color = "limegreen";
//   }

//   /* ---------- UI ---------- */

//   return (
//   <div style={{
//     minHeight: "100vh",
//     backgroundColor: "#0f172a",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     fontFamily: "Inter, sans-serif",
//     color: "white"
//   }}>
//     <div style={{
//       width: "900px",
//       backgroundColor: "#1e293b",
//       padding: "40px",
//       borderRadius: "16px",
//       boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
//     }}>
      
//       <h1 style={{
//         fontSize: "32px",
//         marginBottom: "30px"
//       }}>
//         Placement Readiness Tracker
//       </h1>

//       {/* CONTENT BELOW */}

//       {/* SET GOAL */}
//       <div>
//         <h3>Set Weekly Goal</h3>
//         <input
//           type="number"
//           value={goalInput}
//           onChange={(e) => setGoalInput(e.target.value)}
//           placeholder="Enter weekly goal"
//         />
//         <button onClick={handleSetGoal}>Set Goal</button>
//       </div>

//       {/* ADD PROGRESS */}
//       <div style={{ marginTop: "20px" }}>
//         <h3>Update Progress</h3>
//         <input
//           type="number"
//           value={solvedInput}
//           onChange={(e) => setSolvedInput(e.target.value)}
//           placeholder="Problems solved today"
//         />
//         <button
//   onClick={handleAddSolved}
//   style={{
//     padding: "8px 16px",
//     borderRadius: "8px",
//     border: "none",
//     backgroundColor: "#16a34a",
//     color: "white",
//     cursor: "pointer"
//   }}
// >
//   Add
// </button>
//       </div>

//       {/* PROGRESS DISPLAY */}
//       <div style={{ marginTop: "30px" }}>
//         <h3>Progress</h3>

//         <p>Weekly Goal: {weeklyGoal}</p>
//         <p>Completed: {completed}</p>
//         <p>Progress: {percentage.toFixed(2)}%</p>

//         <p style={{ color }}>
//           Status: {status}
//         </p>

//         {/* PROGRESS BAR */}
//         <div
//           style={{
//             width: "300px",
//             height: "20px",
//             backgroundColor: "#ddd",
//             borderRadius: "10px",
//             overflow: "hidden",
//             marginTop: "10px"
//           }}
//         >
//           <div
//             style={{
//               width: `${percentage}%`,
//               height: "100%",
//               backgroundColor: color,
//               transition: "0.3s ease"
//             }}
//           ></div>
          
//         </div>
//      <button
//   onClick={handleReset}
//   style={{
//     padding: "8px 16px",
//     borderRadius: "8px",
//     border: "none",
//     backgroundColor: "#dc2626",
//     color: "white",
//     cursor: "pointer",
//     marginTop: "15px"
//   }}
// >
//   Reset Week
// </button>
//       </div>
//     </div>
//   );
// }

// export default PRT;

import { useState, useEffect } from "react";

/* ---------- WEEK NUMBER FUNCTION ---------- */
function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);

  const diff =
    now - start +
    (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;

  const oneWeek = 604800000; // ms in one week
  return Math.floor(diff / oneWeek);
}

function PRT() {
  /* ---------- STATE ---------- */
  const [weeklyGoal, setWeeklyGoal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [savedWeek, setSavedWeek] = useState(getWeekNumber());
  const [goalInput, setGoalInput] = useState("");
  const [solvedInput, setSolvedInput] = useState("");

  /* ---------- WEEK RESET EFFECT ---------- */
  useEffect(() => {
    const currentWeek = getWeekNumber();

    if (savedWeek !== currentWeek) {
      setCompleted(0);
      setSavedWeek(currentWeek);
    }
  }, [savedWeek]);

  /* ---------- HANDLERS ---------- */
  const handleSetGoal = () => {
    const goal = parseInt(goalInput);
    if (!goal || goal <= 0) return;

    setWeeklyGoal(goal);
    setCompleted(0);
    setGoalInput("");
  };

  const handleAddSolved = () => {
    if (!weeklyGoal) {
      alert("Set weekly goal first!");
      return;
    }

    const value = parseInt(solvedInput);
    if (!value || value <= 0) return;

    const newCompleted = completed + value;

    setCompleted(newCompleted);
    setSolvedInput("");

    if (newCompleted >= weeklyGoal) {
      alert("🎉 Weekly Goal Completed!");
    }
  };

  const handleReset = () => {
    setCompleted(0);
  };

  /* ---------- CALCULATIONS ---------- */
  const percentage = weeklyGoal ? (completed / weeklyGoal) * 100 : 0;

  let status = "";
  let color = "";

  if (percentage < 40) {
    status = "Lagging Behind";
    color = "#ef4444";
  } else if (percentage < 80) {
    status = "Keep Pushing";
    color = "#f97316";
  } else {
    status = "On Track";
    color = "#22c55e";
  }

  /* ---------- STYLES ---------- */
  const inputStyle = {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #475569",
    backgroundColor: "#334155",
    color: "white",
    marginRight: "10px",
    fontSize: "14px",
    outline: "none"
  };

  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  };

  /* ---------- UI ---------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, sans-serif",
        color: "white",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          backgroundColor: "#1e293b",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "30px",
            fontWeight: "700"
          }}
        >
          Placement Readiness Tracker
        </h1>

        {/* SET GOAL */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>Set Weekly Goal</h3>
          <input
            type="number"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="Enter weekly goal"
            style={inputStyle}
          />
          <button onClick={handleSetGoal} style={buttonStyle}>
            Set Goal
          </button>
        </div>

        {/* ADD PROGRESS */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "10px", fontSize: "18px" }}>Update Progress</h3>
          <input
            type="number"
            value={solvedInput}
            onChange={(e) => setSolvedInput(e.target.value)}
            placeholder="Problems solved today"
            style={inputStyle}
          />
          <button
            onClick={handleAddSolved}
            style={{
              ...buttonStyle,
              backgroundColor: "#16a34a"
            }}
          >
            Add
          </button>
        </div>

        {/* PROGRESS DISPLAY */}
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ marginBottom: "15px", fontSize: "18px" }}>Progress</h3>

          <p style={{ marginBottom: "8px" }}>Weekly Goal: {weeklyGoal}</p>
          <p style={{ marginBottom: "8px" }}>Completed: {completed}</p>
          <p style={{ marginBottom: "8px" }}>Progress: {percentage.toFixed(2)}%</p>

          <p style={{ color, fontWeight: "600", marginBottom: "15px" }}>
            Status: {status}
          </p>

          {/* PROGRESS BAR */}
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "24px",
              backgroundColor: "#334155",
              borderRadius: "12px",
              overflow: "hidden",
              marginTop: "10px"
            }}
          >
            <div
              style={{
                width: `${Math.min(percentage, 100)}%`,
                height: "100%",
                backgroundColor: color,
                transition: "width 0.3s ease"
              }}
            ></div>
          </div>

          <button
            onClick={handleReset}
            style={{
              ...buttonStyle,
              backgroundColor: "#dc2626",
              marginTop: "15px"
            }}
          >
            Reset Week
          </button>
        </div>
      </div>
    </div>
  );
}

export default PRT;