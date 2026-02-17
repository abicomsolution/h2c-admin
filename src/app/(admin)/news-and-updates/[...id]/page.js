

import { use } from 'react'
import React from 'react';
import { Suspense } from 'react';
import DataForm from './dataform';
import PreLoader from '@/components/preloader';


export default async function AeHighlight({ params }) {

  const { id } = await params;

  
  let pid = ""
  if (id && id.length > 0) {
    pid = id[0];
  }

  return (    
        <Suspense fallback={<PreLoader />}>
            <DataForm id={pid} />   
        </Suspense>      
  );
}
