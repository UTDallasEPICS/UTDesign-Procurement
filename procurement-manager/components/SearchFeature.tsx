import React, { useState, ChangeEvent } from 'react'
import { Form, InputGroup } from 'react-bootstrap';

const SearchBar: React.FC = () => {
    const [InputVal, setInputval] = useState<string>(' ');
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputval(event.target.value);
    };



    return <>
        <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
            <Form.Control
                placeholder="Username"
                aria-label="Username"
                aria-describedby="basic-addon1"
                onChange={handleInputChange}
            />
        </InputGroup>
    </>
}