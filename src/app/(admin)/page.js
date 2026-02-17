
import React from 'react';
import { Suspense } from 'react';
import DataPage from './datapage'
import PreLoader from '@/components/preloader';


export default function Home() {
  return (
     <Suspense fallback={<PreLoader />}>
         <DataPage />   
     </Suspense>   
  );
}
