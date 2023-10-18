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
      <Button 
        style={{ 
        position: 'absolute', 
        width: 1350, height: 100, 
        top: 150, left: 85,
        borderColor: 'black', 
        backgroundColor: 'lightgray' }}>
        <p style = {{position: 'absolute', fontSize: 25, color: 'black', textIndent: 20, bottom: 45}}>#</p>
        <p style = {{position: 'absolute', fontSize: 25, color: 'green', textIndent: 125, bottom: 45}}>Template Project</p>
        <p style = {{position: 'absolute', fontSize: 25, color: 'black', textIndent: 700, bottom: 45}}>Total Budget:</p>
        <p style = {{position: 'absolute', fontSize: 25, color: 'black', textIndent: 1000, bottom: 45}}>Remaining Budget:</p>
        <p style = {{position: 'absolute', fontSize: 16, color: 'black', textIndent: 20, bottom: 20}}>Mentors:</p>
        <p style = {{position: 'absolute', fontSize: 16, color: 'black', textIndent: 20, bottom: -5}}>Students:</p>
      </Button>
      
    </>
  );
};

export default Ready;
