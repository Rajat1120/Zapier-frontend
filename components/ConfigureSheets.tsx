const ConfigureSheets = () => {
  return (
    <div className="flex p-5 flex-col gap-y-2">
      <span className="text-sm font-semibold text-[#333333]">
        Spreadsheet <span className="text-[#ff6666]">*</span>
      </span>
      <div className="flex justify-between border cursor-pointer hover:border-black text-sm font-semibold transition-all duration-500 p-2">
        <button className="border-none cursor-pointer outline-0">
          <span className="text-[#808080]">Choose value</span>
        </button>
        <div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
          >
            <path
              stroke="#535358"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 20l7 7 7-7M23 12l-7-7-7 7"
            ></path>
          </svg>
        </div>
      </div>
      <span className="text-sm font-semibold text-[#333333]">
        Worksheet <span className="text-[#ff6666]">*</span>
      </span>
      <div className="flex justify-between border cursor-pointer hover:border-black text-sm font-semibold transition-all duration-500 p-2">
        <button className="border-none cursor-pointer outline-0">
          <span className="text-[#808080]">Choose value</span>
        </button>
        <div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
          >
            <path
              stroke="#535358"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 20l7 7 7-7M23 12l-7-7-7 7"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ConfigureSheets;
