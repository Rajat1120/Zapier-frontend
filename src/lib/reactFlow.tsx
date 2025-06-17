export const initialNodes = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    data: {
      label: (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              fontSize: "8px",
              padding: "2px 6px",
              backgroundColor: "#eee",
              borderRadius: "4px",
              fontWeight: "bold",
              display: "flex",
              justifyItems: "start",
              gap: "4px",
              width: "fit-content",
              border: "1px solid black",
            }}
          >
            <div>
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
            </div>
            Trigger
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#666666",
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            1. Select the event that starts your zap
          </div>
        </div>
      ),
    },
    connectable: false,
    style: { width: 240, height: 60 },
  },
  {
    id: "2",
    position: { x: 0, y: 100 },
    data: {
      label: (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              fontSize: "8px",
              padding: "2px 6px",
              backgroundColor: "#eee",
              borderRadius: "4px",
              fontWeight: "bold",
              display: "flex",
              justifyItems: "start",
              gap: "4px",
              width: "fit-content",
              border: "1px solid black",
            }}
          >
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
            Action
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#666666",
              textAlign: "left",
              fontWeight: "bold",
            }}
          >
            2. Select the event for your zap to run
          </div>
        </div>
      ),
    },
    connectable: false,
    style: { width: 240, height: 60 },
  },
];
