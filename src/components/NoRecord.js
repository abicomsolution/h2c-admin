import { CircleSlash2 } from "lucide-react";

export default function NoRecord() { 
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">          
          <div className="flex flex-col items-center gap-1 text-center">    
                <div>
                    <div className="flex justify-center">
                        <CircleSlash2 className="h-10 w-10 text-gray-300"/>
                    </div>
                    <p className="text-sm text-gray-600 pt-2">No records to display</p>
                </div>          
          </div>         
      </main>
    );
  }
  