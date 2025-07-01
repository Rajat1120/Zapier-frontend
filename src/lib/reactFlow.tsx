export const icon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    height="14"
    width="14"
    color="GrayWarm8"
    name="miscBolt"
  >
    <path
      fill="#2D2E2E"
      d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4.87-11L11 18v-5H7.13L13 6v5h3.87Z"
    ></path>
  </svg>
);

export const generateInitialNodes = (count: number) => {
  const baseStyle = {
    fontSize: "8px",
    padding: "2px 6px",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    fontWeight: "bold",
    display: "flex",
    justifyItems: "start",
    gap: "4px",
    width: "fit-content",
    border: "1px solid #cccccc",
  };

  const descriptionStyle = {
    fontSize: "10px",
    color: "#666666",
    textAlign: "left" as const,
    fontWeight: "bold",
  };

  const nodes = [];

  for (let i = 0; i < count; i++) {
    const isTrigger = i === 0;

    nodes.push({
      id: `${i + 1}`,
      position: { x: 0, y: i * 100 },
      data: {
        label: (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={baseStyle}>
              <div>{icon}</div>
              {isTrigger ? "Trigger" : "Action"}
            </div>
            <div style={descriptionStyle}>
              {i + 1}.{" "}
              {isTrigger
                ? "Select the event that starts your zap"
                : "Select the event for your zap to run"}
            </div>
          </div>
        ),
      },
      connectable: false,
      style: { width: 240, height: 60 },
    });
  }

  return nodes;
};
