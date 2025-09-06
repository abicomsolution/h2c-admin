import { Loader2 } from "lucide-react"


export default function Process() { 
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">          
          <div className="flex flex-col items-center gap-1 text-center">
              <Loader2 className="h-10 w-10 animate-spin"/>
              <p className="text-sm text-gray-600 pt-2">Processing...please wait.</p>
          </div>         
      </main>
    );
  }
  