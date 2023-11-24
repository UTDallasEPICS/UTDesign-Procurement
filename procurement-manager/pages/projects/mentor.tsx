/**
 * This is the Mentors View for the Projects Page
 */

import React from 'react'; 
import Head from 'next/head';

const NotReadyMessage = ({ title }: { title: string }) => {
  return (
    <>
      <Head>
        <title> {title} </title>
      </Head>
      <div> Not ready yet </div>
    </>
  );
};

export default NotReadyMessage;
