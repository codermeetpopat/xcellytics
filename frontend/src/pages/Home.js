import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import ExtraContent from "./ExtraContent";
import Content from "./Content";

function Home() {
  const navigate = useNavigate();
  return (
    <>
    <div
      className="home-bg"
      style={{
        backgroundImage: `url('https://ibb.co/DPF6Mx94')`,
      }}
    >
      <div className="home-content">
        <h1 className="home-title">Excel File Analytics</h1>
        <p className="home-desc">
          Effortlessly upload, view, and analyze your Excel files online. Our platform offers instant statistics, chart visualizations, and secure file management for all your spreadsheet needs.<br/>
         <span>A detective or investigator for spreadsheets.</span>
        </p>
        <button className="home-about-btn" onClick={() => navigate("/about")}>
          Features
        </button>
      </div>
    </div>
    
    <div>
      <ExtraContent />
    </div>
    <div>
      <Content />
    </div>
    </>
  );
}

export default Home;