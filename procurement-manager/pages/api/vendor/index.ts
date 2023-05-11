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
      {
        vendorName: '3BG Supply',
        vendorCategory:
          'bearings, bushings, gears, idlers, tensioners, pulleys, sheaves, sprockets, electric motors, seals, machine guards, transmission belts ',
      },
      {
        vendorName: '80/20 Inc.',
        vendorCategory:
          'aluminum framing system. Not compatible with Unistrut components. Sold locally by Shepherd Controls ',
      },
      {
        vendorName: 'Apex Magnets ',
        vendorCategory: 'magnets and magnetic products',
      },
      {
        vendorName: 'Applied Magnets',
        vendorCategory:
          'magnets and magnetic products, wind turbine generators and blades',
      },
      {
        vendorName: 'ASCO',
        vendorCategory: 'electrically operated (solenoid) valves',
      },
      {
        vendorName: 'Berg',
        vendorCategory:
          'precision mechanical parts such as gears, cams, sprockets, pulleys, belts, roller chains, bearings, lead screws',
      },
      {
        vendorName: 'Bimba',
        vendorCategory:
          'pneumatic, hydraulic, and electric actuators, air preparation, and motion control products',
      },
      {
        vendorName: 'ChillX Chillers',
        vendorCategory:
          'temperature/humidity controllers, pumps, exchangers, immersion coils/wort chillers, electronic valves, manifolds',
      },
      {
        vendorName: 'Cold & Colder',
        vendorCategory: 'peltiers, water pumps, water block, silicone tubing',
      },
      {
        vendorName: 'Compressed Air Systems',
        vendorCategory:
          'compressors, tanks, generators, chillers, vacuums, air tools, monitors, lubricants, filters, accessories',
      },
      {
        vendorName: 'Control Specialties',
        vendorCategory:
          'steam/air/water/vacuum motors, automation, parts, filtration, regulators, pumps, process equipment, rotary joints and unions',
      },
      {
        vendorName: 'EFDYN',
        vendorCategory:
          'industrial motion management, design, manufacture, and distribute a wide array of linear, rotary deceleration and control technologies',
      },
      {
        vendorName: 'FLW',
        vendorCategory:
          'measurement/control/calibration products, hoods, meters, transducers, thermometers, recorders, environmental chambers',
      },
      {
        vendorName: 'Hartfiel Automation',
        vendorCategory:
          'conveyors, controls, sensors, aluminum extrusion, robotics, cable/cord sets, industrial vacuum/networking/PC/vision',
      },
      {
        vendorName: 'Home Depot',
        vendorCategory:
          'Mechanical items - can be picked up at store by students',
      },
      {
        vendorName: 'Lowe’s',
        vendorCategory:
          'Mechanical items - can be picked up at store by students',
      },
      {
        vendorName: 'McMaster-Carr',
        vendorCategory:
          'abrading/polishing, building/grounds, electrical/lighting, fabricating, fastening/joining, filtering, flow/level control, furniture/storage, hand tools, hardware, heating/cooling, lubricating, material handling, measuring/inspecting, office supplies/signs, pipe, tubing, hose/fittings, plumbing/janitorial, power transmission, pressure/temperature control, pulling/lifting, raw materials, safety supplies, sawing/cutting, sealing, shipping, suspending',
      },
      {
        vendorName: 'Midwest Motion Products',
        vendorCategory:
          'design, manufacturing and distribution of standard and custom motion control equipment',
      },
      {
        vendorName: 'OpenBuilds Part Store',
        vendorCategory:
          'machine bundles, materials, rails/actuators, Gantry carts, hardware, software, electronics, components, tools',
      },
      {
        vendorName: 'Parker',
        vendorCategory:
          'components/Systems for control of motion and fluid flow such as pneumatic actuators, fittings, valves, pumps, seals',
      },
      {
        vendorName: 'Progressive Automations',
        vendorCategory:
          'actuators, actuator parts, lifts, control systems, PLC controls, mounting brackets, power supplies, wiring and connectors ',
      },
      {
        vendorName: 'Ryan Herco Flow Solutions',
        vendorCategory:
          'tubing, pipe, hose, valves, pumps, and other fluid handling components. Good selection of plastic components',
      },
      {
        vendorName: 'shopPOPdisplays',
        vendorCategory:
          'boxes, pedestals, risers, signage, holders, mirrors, bins, shelves, racks, grid walls, office supplies, organizers, fixtures, accessories',
      },
      {
        vendorName: 'Swagelok',
        vendorCategory:
          'tube/hose/pipe components and fittings. Sold locally by Texas Valve and Fitting ',
      },
      {
        vendorName: 'Technical Glass Products, Inc.',
        vendorCategory:
          'quartz labware, rods, tubing, plates, discs, slides, cover slips, joints, semiconductor ware',
      },
      {
        vendorName: 'Teknic',
        vendorCategory:
          'servo motors, all-in-one servos, integrated controllers, servo drives, power supplies',
      },
      {
        vendorName: 'Timken',
        vendorCategory:
          'bearings, seals, power transmission products, motion control systems',
      },
      {
        vendorName: 'TNUTZ',
        vendorCategory: 'alternative supplier for 80/20 compatible components',
      },
      {
        vendorName: 'Unist',
        vendorCategory:
          'framing system available in multiple materials. Not compatible with 80/20 components',
      },
      {
        vendorName: 'Versa Valves',
        vendorCategory: 'actuated valves for pneumatics and hydraulics',
      },
      {
        vendorName: 'VXB Ball Bearings',
        vendorCategory:
          'ball bearings, wheels and casters, tools, lubricants, seals, washers, bearings, timing belts/pulleys, nuts and bolts',
      }, //end of mechanical
      //start of medical
      {
        vendorName: 'ADW Diabetes',
        vendorCategory:
          'monitors, tests, lancets, catheters, CPAPs, feeding, feet, home medical equipment, incontinence, ostomy, pharmacy, respiratory',
      },
      {
        vendorName: 'AED',
        vendorCategory:
          'automated external defibrillators and AED accessories ',
      },
      {
        vendorName: 'Beckman Coulter',
        vendorCategory:
          'automation systems, chemistry, tools, microbiology, protein chemistry, urinalysis',
      },
      {
        vendorName: 'Cole-Parmer',
        vendorCategory:
          'temperature measurement and control, electrochemistry, laboratory/industrial fluid products, instrumentation, equipment, supplies',
      },
      {
        vendorName: 'Eppendorf',
        vendorCategory:
          'pipettes, dispensers, centrifuges, mixers, spectrometers, DNA amplification, freezers, fermenters, bioreactors, CO2 incubators, shakers',
      },
      {
        vendorName: 'Fisher Scientific',
        vendorCategory:
          'balances, scales, centrifuges, chromatography, chemicals, instruments, storage, pipettes, syringes, gloves, glasses, cleaning, tubes',
      },
      {
        vendorName: 'Medline',
        vendorCategory: 'manufacturer and distributor of healthcare products',
      },
      {
        vendorName: 'Shop Anatomical',
        vendorCategory:
          'human and animal anatomy models and charts, simulators',
      }, //end of medical
      //start of raw materials
      {
        vendorName: 'Brick In The Yard',
        vendorCategory: 'molding, casting, and special effects supplies ',
      },
      {
        vendorName: 'Ellsworth Adhesives',
        vendorCategory:
          'adhesives, sealants, lubricants, coatings, encapsulants, tapes, soldering products, dispensing equipment',
      },
      {
        vendorName: 'ePlastics',
        vendorCategory: 'various types and shapes of plastics',
      },
      {
        vendorName: 'Home Depot',
        vendorCategory: 'can be picked up at store by students',
      },
      {
        vendorName: 'Lowe’s For Pros',
        vendorCategory: 'can be picked up at store by students',
      },
      {
        vendorName: 'Metal Supermarkets',
        vendorCategory:
          'local supplier of small quantity metals. Products available on a walk-in basis. Call (972) 422-5167 for quotation',
      },
      {
        vendorName: 'Precision Grinding, Inc.',
        vendorCategory:
          'custom steel fabrication, plasma cutting and plate burning, stress relieving, annealing, grinding, CNC milling & turning',
      },
      {
        vendorName: 'Professional Plastics',
        vendorCategory: 'various types and shapes of plastic',
      },
      {
        vendorName: 'Regal Plastics',
        vendorCategory:
          'plastic materials/sheets/film/rods/tubes, acrylic/plexiglass, Polygal, custom fabrication',
      },
      {
        vendorName: 'Reynolds Advanced Materials',
        vendorCategory:
          'materials and composites for making molds, casts, and skin effects',
      },
      {
        vendorName: 'Trident',
        vendorCategory: 'common and hard to find metals',
      }, //end of raw materials
      //start machine and fab
      {
        vendorName: 'Bates Machine & Mfg.',
        vendorCategory: 'full-service CNC machine shop',
      },
      {
        vendorName: 'eMachineShop',
        vendorCategory:
          'traditional metalworking capabilities, waterjet cutting, wire EDM, and plastic injection molding',
      },
      {
        vendorName: 'Heavy Metal',
        vendorCategory: 'general machine shop',
      },
      {
        vendorName: 'MIINC',
        vendorCategory: 'piping, welding, and general mechanical fabrication',
      },
      {
        vendorName: 'Proto Labs, Inc.',
        vendorCategory: 'Digital Manufacturing',
      },
      {
        vendorName: 'Texas Pro Fab',
        vendorCategory: 'sheet metal fabricator',
      },
      {
        vendorName: 'Texas Tool & Die',
        vendorCategory: 'machining, welding, and metal fabrication',
      },
      {
        vendorName: 'Xometry',
        vendorCategory:
          'CNC machining/milling/turning, sheet metal fabrication and cutting, injection molding',
      }, //end of machine and fab
      //start of 3d printing
      //services
      {
        vendorName: '3D Dallas Printing',
        vendorCategory: '3D printing services',
      },
      {
        vendorName: 'GoEngineer',
        vendorCategory: '3D printing services',
      },
      {
        vendorName: 'HUBS',
        vendorCategory: '3D printing services',
      },
      {
        vendorName: 'Shapeways',
        vendorCategory: '3D printing services',
      },
      {
        vendorName: 'Stratasys',
        vendorCategory: '3D printing services',
      },
      {
        vendorName: 'Xometry',
        vendorCategory: '3D printing services',
      },
      //Materials
      {
        vendorName: 'MatterHackers ',
        vendorCategory: '3D printing materials',
      },
      {
        vendorName: 'MonoPrice',
        vendorCategory: '3D printing materials',
      }, //end of 3d printing
      //start of local retail
      {
        vendorName: 'Home Depot',
        vendorCategory: 'can be picked up at store by students',
      },
      {
        vendorName: 'Lowe’s For Pros',
        vendorCategory: 'can be picked up at store by students',
      },
      {
        vendorName: 'Micro Center',
        vendorCategory: 'must be purchased at the store by UTDesign admin',
      }, //end of local retail
      //start of not allowed
      // {
      //   vendorName: 'Amazon',
      //   vendorCategory:
      //     'not allowed if one of the preferred vendors carry the item',
      // },
      // {
      //   vendorName: 'eBay',
      //   vendorCategory: 'not allowed',
      // },
      // {
      //   vendorName: 'Johnson Plastics',
      //   vendorCategory: 'not allowed',
      // },
      // {
      //   vendorName:
      //     'Any auction site (e.g., Craigslist) or international vendor',
      //   vendorCategory: 'not allowed',
      // },
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
