/**
 * This is the Admin View for the Projects Page
 */

import React from 'react'; 
import Head from 'next/head';

const Ready = ({ title }: { title: string }) => {
  return (
    <>
      <Head>
        <title> {title} </title>
      </Head>
      <div style={{ 
        position: 'absolute', 
        width: 1350, height: 100, 
        top: 150, left: 85, 
        backgroundColor: 'lightgray' }}>
        <p style = {{position: 'absolute', fontSize: 25, textIndent: 20}}>#</p>
        <p style = {{position: 'absolute', fontSize: 25, color: 'green', textIndent: 125}}>Template Project</p>
        <p style = {{position: 'absolute', fontSize: 25, textIndent: 700}}>Total Budget:</p>
        <p style = {{position: 'absolute', fontSize: 25, textIndent: 1000}}>Remaining Budget:</p>
        <p style = {{position: 'absolute', fontSize: 16, textIndent: 20, bottom: 20}}>Mentors:</p>
        <p style = {{position: 'absolute', fontSize: 16, textIndent: 20, bottom: -5}}>Students:</p>
      </div>
      
    </>
  );
};

export default Ready;
