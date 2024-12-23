### Copyright Notice

© 2024 Paul Galjan. All rights reserved. This project and its contents, including any designs, specifications, and associated materials, are protected by copyright law. Unauthorized use, reproduction, or distribution of this document or any part of its contents is prohibited without the express written permission of Paul Galjan.

### Legal Use and Restrictions

This document is intended solely for personal use and may not be shared, reproduced, or modified without prior written consent. Violators may be subject to legal action.

# Overview
Atlas is a conceptual multi-user structure visualization and annotation platform featuring a modular interactive renderer that allows the user to create or calculate multiple structured or unstructured views of a shared dataset (represented as "Elements" and "Records" in the object model). These views can be shared with others, and the same data may be represented in different views while maintaining consistency.

The front-end is paired with a simple, flexible and scalable multi-user key/value store for user annotation of the data, along with subsequent reporting.

The same data set can be leveraged in multiple structures, leaving the user free to create multiple structures of the same library. The links between each element in the renderer can carry its own attributes, allowing for dynamic re-representation, aggregation, and summarization of data based on the rendered view.  This allows visual and quantitative comparison based on the relationships defined by the user in the renderer. 

###### example implementation

![map](./img/author-atlas.drawio.png)

# Use Cases

* **Strategy teams** can collaborate to quickly generate, iterate, assess, and compare business plan and proposal assets.
* **Analysts** can construct reports across structures for comparative and historical analysis.
* **Generative AI Consumers** can structure GenAI output for human curation, research, and annotation
* **Instructors** can distribute syllabus and other assets, and gather assets from **learners**, who can leverage it for structured notetaking aligning to a learning plan or independent course of study
* **Content Managers** can re-imagine legacy record interfaces, constructing persona-aligned navigation experiences
* **Buy-side planners** can collect and report on assets from vendors, suppliers and distributors.
* **Consultants** can create flexible, semi-structured data sets and no-code UIs for comparative analysis.
* **UX Designers** can create user-friendly rhizomatic data collection patterns, with progressive detail exposure.

# Architecture

![](./img/arch.svg)

## Object Model

Each `Structure User` can create, read, update, delete, and share `Structures`, which represent an idea acted on by an individual or group of people.  In an educational setting, this could be a class syllabus or group project, in an academic setting this might represent a field of research or domain specialty, in a corporate setting it could represent a business proposal.

Structures are comprised of `Elements`.  Each Element is associated with a single uniquely identitified `Record`.  Each Record can contain data of any type as defined by the Structure Owner(s).  Additionally, the Structure Owner can define an `Element Type`, which can be used to associate a library of record formats to element types, and filtering in downstream analysis.

Elements are represented on one or more `Structure Maps`, which are graphical representations of the elements on an infinite scroll 2D canvas.  Elements may be connected to other Elements in the Structure Map via zero or more `Element Links`, which are also associated with a single uniquely identified Record, the attributes of which are separately defined by the Structure Owner.  Structure Maps may also be linked to Elements residing in external Structures via `Structure Links`.

## Data Model

```mermaid
erDiagram

Subscription one to one Plan : "holds"
Subscription one to one User : "maintains"

Role many to one User : "has"
ApiKey many to one User : "has"
Token many to one User : "has"

User one to many Backup : "manages"
User one to many Attachment : "controls"
User many to one DeletionLog : "logs to"
User many to one AuditLog : "logs to"
User one to many Structure : "contributes to"

Structure one to many Backup : "resides in"
Structure one to many Renderer: "displayed in"
Structure one to many Element : "contains"
Structure one to many Webhook : "sends"
Structure one to many StructureMap : "represented by"
Element one to many StructureMap : "present in"


Element one to one or zero Record : "may have"
Element one to many ElementLink : "source links"
Element one to many ElementLink : "target links"
Element one to many ParsedContent : "may have"
Element one to one ElementLink : "may have"

StructureMap{
    id int "autoincrement()"
    createdAt DateTime
    updatedAt DateTime
    name string
    description string "?"
    elements Element[]
    structure Structure
}

Structure {
    id int "autoincrement()"
    createdAt DateTime
    updatedAt DateTime
    deletedAt DateTime
    visibility enum
    owner User
    elements Element[]
    backups Backup[]
    wbsPrefix string "n."
    renderers Renderer[]
    parsedData ParsedContent[]
    Webhook Webhook[]
    StructureMap StructureMap[]
}



ParsedContent {
    id int "autoincrement()"
    pseudoGUID string "uuid()"
    type string
    wbs string
    level int
    element string
    uniqWBS string
    markmapMM string
    additionalData json "?"
    createdAt DateTime
    structure Structure "?"
    Element Element[]
}

Element{
    id int "autoincrement()"
    recordId int "?"
    type string "?"
    pseudoGuid string "uuid()"
    uniqWBS string
    wbsLevel int
    wbsNumber string "n."
    markmapMM string
    createdAt DateTime
    updatedAt DateTime
    structure Structure
    metadata Record "?"
    sourceLinks ElementLink[]
    targetLinks ElementLink[]
    StructureMap StructureMap[]
    parsedContent ParsedContent "?"
    ElementLink ElementLink "?"
}

ElementLink {
    id int "autoincrement()"
    createdAt DateTime
    updatedAt DateTime
    sourceElement Element
    targetElement Element
    Element Element[]
}

Subscription {
    id int "autoincrement()"
    features json
    startDate DateTime
    endDate DateTime
    status enum 
    user User
    plan Plan
}

Plan {
    id int "autoincrement()"
    name string
    description string
    price decimal
    features json
    subscriptions Subscription[]
}

Role {
    id int "autoincrement()"
    name string
    description string
    users User[]
    User User[]
}

ApiKey{
    id int "autoincrement()"
    name string
    createdAt DateTime
    updatedAt DateTime
    user User
    expiresAt DateTime "is this needed as well?"
}

Token{
    id int "autoincrement()"
    key string
    value string
    createdAt DateTime
    updatedAt DateTime
    expiresAt DateTime
    user User
}

Renderer {
    id int "autoincrement()"
    type string
    config json
    customSettings json
    createdAt DateTime
    updatedAt DateTime
    structure Structure
}

Attachment {
    id int "autoincrement()"
    fileUrl string
    fileType string
    data json
    createdAt DateTime
    updatedAt DateTime
    user User
}

User {
   id int "autoincrement()"
   createdAt DateTime
   updatedAt DateTime "is this needed as well"
   deletedAt DateTime
   username string
   password string
   email string
   role Role "?"
   roles Role[]
   structures Structure[]
   apikeys ApiKey[]
   auditLogs AuditLog[]
   subscription Subscription "?"
   attachments Attachment[]
   tokens Token[]
   backups Backup[]
   deletionLogs DeletionLog[]
}

DeletionLog {
   id int "autoincrement()"
   element string
   elementId Int "?"
   deletedAt DateTime
   reason string "?"
   status enum 
   createdAt DateTime
   updatedAt DateTime
   user User
}

AuditLog {
   id int "autoincrement()"
   action string
   element string "?"
   elementId string "?"
   details json
   createdAt DateTime
   user User "?"
}

Backup {
    id int "autoincrement()"
    backupData json
    createdAt DateTime
    updatedAt DateTime
    user User
    structure Structure
}

Webhook {
    id int "autoincrement()"
    url string
    events string[]
    createdAt DateTime
    updatedAt DateTime
    structure Structure
}

Record {
    id int "autoincrement()"
    createdAt DateTime
    updatedAt DateTime
    tags string[]
    elements Element[]
}
```

## User Roles

* **Structure Owner**: Add Collaborators, Structure and Structure Link CRUD, Export Structure
* **Structure Editor**: Edit Structure Map and Records
* **Structure Commenter**:  Browse and comment on structure map and records
* **Structure Viewer**: Browse structure map and records
* **Instance Admininstrator**:  Instance CRUD, Structure Owner CRUD 
  
## Reference and Mock Data Sets

### Kickstarter

Create a structure in excel, preview its WBS numbering, and import it into the Atlas platform

[Download](./AtlasKickstarter.xlsx)

### Example Structures

Example structures for business, engineering, project management and educational use cases

[Download](./unitTestData/element/structureLibrary.csv)

| type                   | dataset                     |
|------------------------|-----------------------------|
| Platform Test          | [Bicycle](https://atlasstructure.tiiny.site/bicycle.html)                     |
| Platform Test          | [Bicycle for UI Sim](https://atlasstructure.tiiny.site/bicyclesim.html)          |
| Platform Test          | [Depth Gauge](https://atlasstructure.tiiny.site/depthGauge.html)                 |
| Platform Test          | [Width Gauge](https://atlasstructure.tiiny.site/widthGauge.html)                 |
| Education              | [Human Languages](https://atlasstructure.tiiny.site/languages.html)             |
| Business               | [Design/Build Project](https://atlasstructure.tiiny.site/designbuild.html)        |
| Business               | [Process Improvement](https://atlasstructure.tiiny.site/processplant.html)         |
| Business               | [Outsourcing Project](https://atlasstructure.tiiny.site/outsource.html)         |
| Business               | [Software Development](https://atlasstructure.tiiny.site/softwaredev.html)        |
| Business               | [Telecom](https://atlasstructure.tiiny.site/telecom.html)                    |
| Business               | [Web Design](https://atlasstructure.tiiny.site/webdesign.html)                  |
| Construction           | [Environmental Remediation](https://atlasstructure.tiiny.site/envmgmt.html)   |
| Construction           | [Factory Construction](https://atlasstructure.tiiny.site/processplant.html)        |
| Construction               | [Production Platform](https://atlasstructure.tiiny.site/prodplatform.html)         |
| Research & Development | [Research Project](https://atlasstructure.tiiny.site/research.html)            |
| Research & Development | [New Compound](https://atlasstructure.tiiny.site/compound.html)                |
| MIL-STD-811F           | [Aircraft System](https://atlasstructure.tiiny.site/aircraft.html)             |
| MIL-STD-811F           | [Electronics/Avionics](https://atlasstructure.tiiny.site/avionics.html)        |
| MIL-STD-811F           | [Missile/Ordnance](https://atlasstructure.tiiny.site/ordnance.html)            |
| MIL-STD-811F           | [Strategic Missile System](https://atlasstructure.tiiny.site/sms.html)    |
| MIL-STD-811F           | [Sea System](https://atlasstructure.tiiny.site/seasystem.html)                  |
| MIL-STD-811F           | [Space System](https://atlasstructure.tiiny.site/spacesystem.html)                |
| MIL-STD-811F           | [Ground Vehicle](https://atlasstructure.tiiny.site/groundvehicle.html)              |
| MIL-STD-811F           | [Unmanned Maritime System](https://atlasstructure.tiiny.site/unmannedmaritime.html)    |
| MIL-STD-811F           | [Launch Vehicle](https://atlasstructure.tiiny.site/launchvehicle.html)              |
| MIL-STD-811F           | [Information/Business System](https://atlasstructure.tiiny.site/infosys.html) |
| MIL-STD-811F           | [Sustainment](https://atlasstructure.tiiny.site/sustainment.html)                 |