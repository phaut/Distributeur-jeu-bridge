import React from "react";

const ImgDepose = ({ area, slots, onSlotClick, title }) => {
  return (
    <div>
      <h4>{title}</h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            area === "center" || area === "north" || area === "south"
              ? "repeat(13, 1fr)"
              : "repeat(7, 1fr)", // 13 colonnes pour center et north, sinon 7
          gap: "5px", // espace entre les slots
          // pointerEvents: "all",
        }}
        /* style={{
          display: area === "east" || area === "west" ? "flex" : "grid",
          flexDirection: area === "east" || area === "west" ? "column" : "row",
          gridTemplateColumns:
            area === "center" || area === "north" || area === "south"
              ? "repeat(13, 1fr)"
              : area === "east" || area === "west"
              ? "none"
              : "repeat(7, 1fr)", // 13 colonnes pour center/north/south, 7 pour le reste sauf east/west
          gap: "5px", // espace entre les slots
        }}*/
      >
        {slots.map((slot, index) => (
          <div
            key={index}
            onClick={() => onSlotClick(area, index)}
            style={{
              width: "40px",
              height: "60px",
              border: "1px solid #000",
              backgroundColor: slot ? "lightgray" : "white",
              position: "relative",
              // pointerEvents: "all",
            }}
          >
            {slot ? (
              <img
                src={slot}
                alt={`Slot ${index}`}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <span
                style={{
                  position: "absolute",
                  top: "5px",
                  left: "5px",
                  backgroundColor: "rgba(110, 174, 234, 0.6)",
                  color: "red",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                }}
              >
                {index + 1}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImgDepose;
