import React, { useState } from 'react'
import { Table } from 'react-bootstrap'
import { prisma } from '@/db'
import { Project, User } from '@prisma/client'

type Props = {
  type: string
  data: User[] | Project[]
}

export default function CustomTable({ type, data }: Props) {
  if (type === 'user') {
    return (
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>NetID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role ID</th>
            <th>Active</th>
            <th>Responsibilities</th>
            <th>Deactivation Date</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((d) => {
            const user = d as User
            return (
              <tr key={user.userID}>
                <td>{user.userID}</td>
                <td>{user.netID}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.roleID}</td>
                <td>{user.active}</td>
                <td>{user.responsibilities}</td>
                <td>{user.deactivationDate?.toString()}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    )
  } else if (type === 'project') {
    return (
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Project Title</th>
            <th>Project Num</th>
            <th>Starting Budget</th>
            <th>Total Expenses</th>
            <th>Type</th>
            <th>Sponsor Company</th>
            <th>Activation Date</th>
            <th>Deactivation Date</th>
            <th>Additional Info</th>
            <th>Cost Center</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((d) => {
            const project = d as Project
            return (
              <tr key={project.projectID}>
                <td>{project.projectID}</td>
                <td>{project.projectTitle}</td>
                <td>{project.projectNum}</td>
                <td>{project.startingBudget.toString()}</td>
                <td>{project.totalExpenses.toString()}</td>
                <td>{project.projectType}</td>
                <td>{project.sponsorCompany}</td>
                <td>{project.activationDate?.toString()}</td>
                <td>{project.deactivationDate?.toString()}</td>
                <td>{project.additionalInfo}</td>
                <td>{project.costCenter}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    )
  } else {
    return <>Oops...</>
  }
}
