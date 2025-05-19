// API to update fields in request like order, process, vendor, request item, and update project expenses

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'
import { Prisma, Vendor } from '@prisma/client'

// used for type checking items and orders passed in so that each attribute is valid
// interface Item
// {
//   itemID: number,
//   description: string,
//   url: string,
//   partNumber: string,
//   quantity: number,
//   unitPrice: number,
//   vendorID: number | undefined,
//   vendorName: string | undefined // only vendorName should be passed in but project page not updated so for now made ID and name optional and pass in 1
// }

interface Item {
  itemID: number;
  description: string;
  url: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  vendorID: number | undefined;  // Can be null or undefined for 'Other' vendor
  vendorName: string | undefined;      // Vendor name can be undefined
  newVendorName?: string;              // Optional, for 'Other' vendors
  newVendorEmail?: string;             // Optional, for 'Other' vendors
  newVendorURL?: string;               // Optional, for 'Other' vendors
}

interface Order
{
  orderID: number,
  dateOrdered: Date,
  orderNumber: string,
  trackingInfo: string,
  orderDetails: string,
  shippingCost: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = req.body
    let request

    const oldRequestForm = await prisma.request.findUnique({
      where: {
        requestID: parseInt(body.requestID),
      },
    })
    if (!oldRequestForm) throw new Error('Could not find that request form')
    const oldReqExpense = oldRequestForm.expense
    console.log('old request expense: ', oldReqExpense)

    // TODO:: update multiple request items and orders instead of 1 by passing in objects and validating using interfaces similar to request-form/index API

    if ('orders' in body) // order details - optional, so only updated if passed in
    { 
      const orders = req.body.orders
      // makes sure each property in order matches the order type before updating
      orders.forEach(async (order: Order) => {
        await updateOrder(order)
      })
    }

    if ('processID' in body) { 
      let process = await prisma.process.findUnique({
        where: {
          processID: parseInt(body.processID)
        }
      })
      if (!process) throw new Error('Could not find process')

      if ('status' in body) {
        request = await prisma.request.update({
          where: {
            requestID: oldRequestForm.requestID,
            processID: process.processID,
          },
          data: {
            process: {
              update: {
                // TODO:: use type checking (could allow admin to pass in status string like "approved" and create status using Status.APPROVED, etc. for different ones)
                status: body.status
              }
            }
          },
        })
      }
    }

    const items = req.body.items
    // makes sure each property in item matches the request item type before updating
    items.forEach(async (item: Item) => {
      await updateItem(item)
    })

    // for now is optional since need to add update order in project page
    if ('totalExpenses' in body) 
    {
      // Find the project to get the total expenses
      let project = await prisma.project.findUnique({
        where: { projectID: parseInt(body.projectID) },
      })
      // Remove the old request expenses before adding the updated expenses to project
      let updateExpense = await prisma.project.update({
        where: { projectID: parseInt(body.projectID) },
        data: {
          totalExpenses: (
            (project?.totalExpenses === undefined
              ? oldReqExpense
              : project.totalExpenses)-
            oldReqExpense
          ),
        },
      })
      project = await prisma.project.findUnique({
        where: { projectID: parseInt(body.projectID) },
      })
      console.log('removed old  - project expenses: ', project?.totalExpenses)
      
      // update with total expenses (from items, orders, etc in request)
      request = await prisma.request.update({ 
        where: {
          requestID: oldRequestForm.requestID,
        },
          data: {
            expense: (body.totalExpenses)
          },
      })
      request = await prisma.request.findUnique({
        where: {
          requestID: oldRequestForm.requestID
        }
      })
      if (request === null) throw new Error('request not found')
      console.log('new request expense: ', request.expense)

      // add updated request expenses to project
      updateExpense = await prisma.project.update({
        where: { projectID: parseInt(body.projectID) },
        data: {
          totalExpenses: (
            (project?.totalExpenses === undefined ? 0 : project.totalExpenses)+
            request.expense
          ),
        },
      })
      project = await prisma.project.findUnique({
        where: { projectID: parseInt(body.projectID) },
      })
      console.log('added new - project expenses: ', project?.totalExpenses)
    }
    
    res.status(200).json({ message: 'Request Form Updated', request: request })
  } catch (error) {
    console.log(error)
    if (error instanceof Error)
    res.status(500).json({
        message: error.message,
        error: error,
    })
    else res.status(500).send(error)
  }
}

/**
 * This function first checks if the item vendor and itemID are valid and then updates the data fields for the request item
 * @param item request item from request item array passed in to API (after type checking)
 */
async function updateItem(item: Item)
{
  try
  {
    let vendor

    if (item.vendorName)
    {
      vendor = await prisma.vendor.findFirst({
        where: 
        {
          vendorName: item.vendorName
        }
      })
      if (!vendor) throw new Error('invalid vendor for item')
    }

    if (item.vendorID)
    {
      vendor = await prisma.vendor.findUnique({
        where: 
        {
          vendorID: Number(item.vendorID)
        }
      })
      if (!vendor) throw new Error('invalid vendor for item')
    }

    const reqItem = await prisma.requestItem.findUnique({
      where: {
        itemID: item.itemID
      }
    })
    if (!reqItem) throw new Error('request item not found')

    const newItem = await prisma.requestItem.update({
      where: {
        itemID: reqItem.itemID,
      },
      data: {
        description: item.description,
        url: item.url,
        partNumber: item.partNumber,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vendorID: vendor?.vendorID
      }
    })
  }
  catch(error) {
    console.log(error)
    if (error instanceof Error)
      console.log(error.message)
  }
}

// async function updateItem(item: Item) {
//   try {
//     let vendor;

//     // Log to check if `newVendorName` is set
//     console.log(`New Vendor Name: ${item.newVendorName}`);

//     // Handle 'Other' vendor case: Create a new vendor with pending status
//     if (item.newVendorName) {
//       vendor = await prisma.vendor.create({
//         data: {
//           vendorName: item.newVendorName,
//           vendorStatus: 'PENDING',
//           vendorEmail: item.newVendorEmail || null, // Ensure null is acceptable in the schema
//           vendorURL: item.newVendorURL?.trim() || 'https://default.com',
//         },
//       });
//       console.log(`Created new vendor: ${vendor.vendorName} with ID: ${vendor.vendorID}`);
//     }

//     // If not 'Other', find the vendor by name or ID
//     if (!vendor && item.vendorName) {
//       vendor = await prisma.vendor.findFirst({
//         where: {
//           vendorName: item.vendorName,
//         },
//       });
//       if (!vendor) throw new Error('Invalid vendor for item');
//     }

//     if (!vendor && item.vendorID) {
//       vendor = await prisma.vendor.findUnique({
//         where: {
//           vendorID: Number(item.vendorID),
//         },
//       });
//       if (!vendor) throw new Error('Invalid vendor for item');
//     }

//     // Validate that the request item exists
//     const reqItem = await prisma.requestItem.findUnique({
//       where: {
//         itemID: item.itemID,
//       },
//     });
//     if (!reqItem) throw new Error('Request item not found');

//     // Update the request item with the new vendor information
//     const newItem = await prisma.requestItem.update({
//       where: {
//         itemID: reqItem.itemID,
//       },
//       data: {
//         description: item.description,
//         url: item.url,
//         partNumber: item.partNumber,
//         quantity: item.quantity,
//         unitPrice: item.unitPrice,
//         vendorID: vendor?.vendorID, // Use the vendorID of the new or existing vendor
//       },
//     });

//     console.log(`Updated item ${item.itemID} with vendor ${vendor?.vendorName || 'unknown'}`);
//   } catch (error) {
//     console.error(error);
//     if (error instanceof Error) {
//       console.error(error.message);
//     }
//   }
// }


/**
 * This function first checks if the orderID is valid and then updates the data fields for the order
 * @param order order from orders array passed in to API (after type checking)
 */
async function updateOrder( order: Order)
{
  try
  {
    const reqOrder = await prisma.order.findUnique({
      where: {
        orderID: order.orderID
      }
    })
    if (!reqOrder) throw new Error('order not found')

    const newOrder = await prisma.order.update({
      where: {
        orderID: reqOrder.orderID,
      },
      data: {
        dateOrdered: order.dateOrdered,
        orderNumber: order.orderNumber,
        trackingInfo: order.trackingInfo,
        orderDetails: order.orderDetails,
        shippingCost: (order.shippingCost)
      }
    })
  }
  catch(error) {
    console.log(error)
    if (error instanceof Error)
      console.log(error.message)
  }
}
