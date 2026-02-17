
import React from 'react';
import { Suspense } from 'react';
import Datapage from './datapage';


function Skeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-200 rounded" />
      <div className="h-3 w-11/12 bg-gray-200 rounded" />
      <div className="h-3 w-10/12 bg-gray-200 rounded" />
    </div>
  );
}

export default function Highlight() {
    
    return (        
        <Suspense fallback={<Skeleton />}>
            <Datapage />   
        </Suspense>                                            
    );
}
