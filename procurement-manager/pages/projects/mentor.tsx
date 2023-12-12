/**
 * This is the Mentors View for the Projects Page
 */

// TODO:: add mentor version of project page by creating MentorProjectCard similar to AdminProjectCard except use worksOn/currentProjects API to get mentor projects to display, and remove edit feature
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
