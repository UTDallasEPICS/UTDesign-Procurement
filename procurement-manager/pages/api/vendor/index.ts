import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/db'

// admin to create projects
// make sure it is admin only

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const VendorCreate = await prisma.vendor.createMany({
    data: [
      {
        vendorName: 'Grainger',
        vendorCategory: 'General_Industrial_Suppliers',
      },
      {
        vendorName: 'Fastenal',
        vendorCategory: 'General_Industrial_Suppliers',
      },
      {
        vendorName: 'Motion Industries',
        vendorCategory: 'General_Industrial_Suppliers',
      }, //end of general suppliers

      {
        //start of electrical
        vendorName: '1stVision',
        vendorCategory:
          'Electrical-machine vision and automated imaging applications ',
      },
      {
        vendorName: 'Adafruit ',
        vendorCategory: 'Electrical components, instrumentation, and sensors',
      },
      {
        vendorName: 'Allied Electronics ',
        vendorCategory: 'Electrical components, instrumentation, and sensors',
      },
      {
        vendorName: 'Anaheim Automation',
        vendorCategory:
          'Electrical-stepper/servo/brush/brushless motors, drivers, controllers, gearboxes, couplings, encoders, linear components/actuators, printed circuit boards, driver packs  ',
      },
      {
        vendorName: 'Automation Direct ',
        vendorCategory:
          'Electrical-designs and manufactures single-board microcontrollers and microcontroller kits for building digital devices ',
      },
      {
        vendorName: 'B&H',
        vendorCategory: 'Electrical-photo, video, and computer equipment',
      },
      {
        vendorName: 'Best Buy',
        vendorCategory: 'Electrical components, instrumentation, and sensors',
      },
      {
        vendorName: 'Building Vision and Variety',
        vendorCategory:
          'Electrical-vacuum chambers, extractors, and material processing equipment',
      },
      {
        vendorName: 'C4LABS',
        vendorCategory:
          'Electrical-boards and cases, gaming parts and accessories',
      },
      {
        vendorName: 'CDW-G',
        vendorCategory:
          'Electrical-cables, computer accessories, computers, data storage, batteries, surge protectors, networking products, monitors',
      },
      {
        vendorName: 'CO2Meter',
        vendorCategory:
          'Electrical-gas detection, monitoring, and analysis solutions',
      },
      {
        vendorName: 'Custom Control Sensors',
        vendorCategory:
          'Electrical-design and manufacturing of pressure, temperature, and flow sensors',
      },
      {
        vendorName: 'Digi-Key',
        vendorCategory: 'Electrical components, instrumentation, and sensors',
      },
      {
        vendorName: 'Faulhaber Micromo',
        vendorCategory:
          'Electrical-motors, gearheads, linear components, encoders, drive electronics, accessories',
      },
      {
        vendorName: 'Keyence',
        vendorCategory:
          'Electrical-sensors, vision system, measurement systems, microscopes, scanners, handheld mobile computers, process controls, static eliminators',
      },
      {
        vendorName: 'Mouser Electronics',
        vendorCategory: 'Electrical components, instrumentation, and sensors',
      },
      {
        vendorName: 'National Instruments',
        vendorCategory:
          'Electrical-data acquisition and automation hardware and software',
      },
      {
        vendorName: 'Newark',
        vendorCategory: 'Electrical components, instrumentation, and sensors',
      },
      {
        vendorName: 'Omega',
        vendorCategory:
          'Electrical-instruments to measure temperature, humidity, pressure, strain, force, flow, level, pH, and conductivity. Data acquisition and electric heating products',
      },
      {
        vendorName: 'PCB Piezotronics',
        vendorCategory:
          'Electrical-accelerometers, load cells, torque sensors, microphones, pressure transmitters',
      },
      {
        vendorName: 'Schneider Electric',
        vendorCategory:
          'Electrical-PLCs, motor starters, drives, circuit breakers, switches, sockets, lighting, transformers, substations, UPS',
      },
      {
        vendorName: 'SparkFun',
        vendorCategory: 'Electrical components, instrumentation, and sensors',
      },
      {
        vendorName: 'Thermal Devices',
        vendorCategory:
          'Electrical-temperature sensing, electrical and motor control, heaters, temperature/process/power controls, and related accessories',
      },
      {
        vendorName: 'ThorLabs',
        vendorCategory: 'Electrical components, instrumentation, and sensors',
      },
      {
        vendorName: 'Watlow',
        vendorCategory:
          'Electrical-industrial heaters, temperature sensors, and controllers as well as assemblies,Sold locally by Southwest Heater & Controls ',
      },
      {
        vendorName: 'Southwest Heater & Controls ',
        vendorCategory:
          'industrial heaters, temperature sensors, and controllers as well as assemblies.',
      },
      //PCB's
      {
        vendorName: 'Advanced Circuits (4PCB)',
        vendorCategory: 'Electrical PCBs',
      },
      {
        vendorName: 'Colorado PCB Assembly',
        vendorCategory: 'Electrical PCBs',
      },
      {
        vendorName: 'ExpressPCB',
        vendorCategory: 'Electrical PCBs',
      },
      {
        vendorName: 'OSH Park ',
        vendorCategory: 'Electrical PCBs',
      },
      {
        vendorName: 'PCB Assembly Express ',
        vendorCategory: 'Electrical PCBs',
      },
      {
        vendorName: 'RushPCB ',
        vendorCategory: 'Electrical PCBs',
      },
      {
        vendorName: 'Suntronic',
        vendorCategory: 'Electrical PCBs',
      },
      //batteries
      {
        vendorName: '18650 Battery Store',
        vendorCategory: 'Electrical Batteries',
      },
      {
        vendorName: 'AA Portable Power Corporation',
        vendorCategory: 'Electrical Batteries',
      },
      //robotics
      {
        vendorName: 'AndyMark',
        vendorCategory:
          'Robotics-develops, manufactures, and distributes mechanical and electrical parts with a focus on robotics',
      },
      {
        vendorName: 'Blue Robotics',
        vendorCategory:
          'Robotics-thruster, actuators, lights, sensors, sonars, cameras, cables, penetrators, connectors, enclosures',
      },
      {
        vendorName: 'Design & Assembly Concepts',
        vendorCategory:
          'Robotics-custom designs and builds machine tending systems, assembly systems, material handling systems, vision systems',
      },
      {
        vendorName: 'RobotShop',
        vendorCategory: 'Robotics-personal and professional robot technology',
      },
      //Raspberry Pi
      {
        vendorName: 'Adafruit',
        vendorCategory: 'Raspberry Pi',
      },
      {
        vendorName: 'Allied Electronics',
        vendorCategory: 'Raspberry Pi',
      },
      {
        vendorName: 'Best Buy',
        vendorCategory: 'Raspberry Pi',
      },
      {
        vendorName: 'CanaKit',
        vendorCategory: 'Raspberry Pi',
      },
      {
        vendorName: 'Digi-Key ',
        vendorCategory: 'Raspberry Pi',
      },
      {
        vendorName: 'Mouser Electronics ',
        vendorCategory: 'Raspberry Pi',
      },
      {
        vendorName: 'PiShop.us',
        vendorCategory: 'Raspberry Pi',
      },
      {
        vendorName: 'SparkFun',
        vendorCategory: 'Raspberry Pi',
      },
      //Cables/Wires
      {
        vendorName: 'Bulk Wire',
        vendorCategory: 'cables, wires, and wiring accessories',
      },
      {
        vendorName: 'C2G',
        vendorCategory:
          'audio/video/computer cables, data connectivity, physical infrastructure, and power management',
      },
      {
        vendorName: 'Cable Wholesale',
        vendorCategory:
          'copper/Fiber network, USB, mobile/Apple, HDMI/home theater cables',
      },
      {
        vendorName: 'Staples',
        vendorCategory: 'Cables/Wires',
      },
      {
        vendorName: 'Office Depot',
        vendorCategory: 'Cables/Wires',
      }, //end of electronics
      //start of mechanical
    ],
  })
  try {
    // creating sample vendor
    const response = await prisma.vendor.create({
      data: {
        vendorName: 'Test Vendor',
      },
    })

    res.status(200).json(response)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error })
  }
}
