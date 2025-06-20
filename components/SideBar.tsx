

"use client"

export default function Sidebar(){



    return  <div className="fixed top-16 right-4 w-[28%] h-[80%] flex  flex-col border-2 border-[#695be8] bg-[#fdf7f2] rounded-md">
        <div className="p-3 rounded-md justify-between  bg-[#f0eefb] flex">
          <div>
            img
            <span>some text</span>
          </div>
          <div>
            <span>make it big</span>
            <span>close it</span>
          </div>
        </div>
        <div className="flex-grow border-b-[#d7d3c9] border overflow-y-auto">
          <div className="p-3">setup</div>
          <div className=" border-t border-b p-3 h-full border-[#d7d3c9]">
            <div className="flex m-2 flex-col">
              <span>App</span>
              <div className="w-full rounded-md  m-1 flex justify-between p-2 border border-[#d7d3c9]">
                <div className="border border-[#d7d3c9] rounded-sm py-1 px-2">
                  img <span className="text-sm">Google sheets</span>
                </div>
                <button className="border border-[#d7d3c9] p-1 rounded-sm ">
                  Change
                </button>
              </div>
            </div>
            <div className="flex m-2 flex-col">
              <span>Action Event</span>
              <div className="w-full m-1 flex justify-between p-2 border border-[#d7d3c9] rounded-md">
                <div>
                  <span className="text-sm">Choose an event</span>
                </div>
                <button>Change</button>
              </div>
            </div>
            <div className="flex m-2 flex-col">
              <span>Account</span>
              <div className="w-full m-1 flex justify-between p-2 border border-[#d7d3c9] rounded-md">
                <div>
                  <span className="text-sm">Select An account</span>
                </div>
                <button>Select</button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm leading-5  ">
                Google Drive is a secure partner with Zapier. Your credentials
                are encrypted and can be removed at any time. You can manage all
                of your connected accounts here.
              </p>
            </div>
          </div>
        </div>
       <div className="p-3 flex justify-center items-center ">
          <button className="w-full bg-[#ece9df] font-bold text-[#737272] p-2" >To continue, choose an event</button>
        </div>
      </div>
}
