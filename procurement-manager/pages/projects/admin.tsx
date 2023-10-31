/**
 * This is the Admin View for the Projects Page
 */

import Head from 'next/head';
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

function Ready() {
  const [isEditing, setIsEditing] = useState(false);
  const [projectNumber, setProjectNumber] = useState ('');
  const [projectName, setProjectName] = useState('Project Template');
  const [totalBudget, setTotalBudget] = useState('');
  const [remainingBudget, setRemainingBudget] = useState('');
  const [mentors, setMentors] = useState('');
  const [students, setStudents] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div>
      <Button
        style={{
          position: 'relative',
          width: 1350,
          height: 100,
          top: 0,
          left: 0,
          borderColor: 'black',
          backgroundColor: 'lightgray',
        }}
      >

        <div>
          <p style = {{position: 'absolute', fontSize: 20, color: 'black', textIndent: 20, bottom: 45}}>
              # {isEditing ? (
              <input
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
                onBlur={handleSave}
                style={{ width: '50px', height: '30px' }}
              />
            ) : (
              projectNumber
            )}
          </p>
        </div>

        <div>
          <p style = {{position: 'absolute', fontSize: 25, color: 'green', textIndent: 125, bottom: 45}}>
              {isEditing ? (
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={handleSave}
                style={{ width: '300px', height: '30px' }}
              />
            ) : (
              projectName
            )}
          </p>
        </div>

        <div>
          <p style = {{position: 'absolute', fontSize: 20, color: 'black', textIndent: 700, bottom: 45}}>
            Total Budget: {isEditing ? (
              <input
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                onBlur={handleSave}
                style={{ width: '150px', height: '30px' }}
              />
            ) : (
              totalBudget
            )}
          </p>
        </div>

        <div>
        <p style = {{position: 'absolute', fontSize: 20, color: 'black', textIndent: 1000, bottom: 45}}>
            Remaining Budget: {isEditing ? (
              <input
                value={remainingBudget}
                onChange={(e) => setRemainingBudget(e.target.value)}
                onBlur={handleSave}
                style={{ width: '150px', height: '30px' }}
              />
            ) : (
              remainingBudget
            )}
          </p>
        </div>

        <div>
          <p style = {{position: 'absolute', fontSize: 16, color: 'black', textIndent: 20, bottom: 20}}>
            Mentors: {isEditing ? (
              <input
                value={mentors}
                onChange={(e) => setMentors(e.target.value)}
                onBlur={handleSave}
                style={{ width: '300px', height: '20px' }}
              />
            ) : (
              mentors
            )}
          </p>
        </div>

        <div>
          <p style = {{position: 'absolute', fontSize: 16, color: 'black', textIndent: 20, bottom: -5}}>
            Students: {isEditing ? (
              <input
                value={students}
                onChange={(e) => setStudents(e.target.value)}
                onBlur={handleSave}
                style={{ width: '300px', height: '20px' }}
              />
            ) : (
              students
            )}
          </p>
        </div>

      </Button>

      <button onClick={isEditing ? handleSave : handleEdit}>
        {isEditing ? "Save" : "Edit"}
      </button>

    </div>
  );
}

export default Ready;
