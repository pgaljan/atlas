
## Object Model

Each `Structure User` can create, read, update, delete, and share `Structures`, which represent an idea acted on by an individual or group of people.  In an educational setting, this could be a class syllabus or group project, in an academic setting this might represent a field of research or domain specialty, in a corporate setting it could represent a business proposal.

Structures are comprised of `Elements`.  Each Element is associated with a single uniquely identitified `Record`.  Each Record can contain data of any type as defined by the Structure Owner(s).  Additionally, the Structure Owner can define and allow `Element Type`, which can be associated to record types, and leveraged in downstream analysis.

Elements are represented on one or more `Structure Maps`, which are graphical representations of the elements on an infinite scroll 2D canvas.  Elements may be connected to other Elements in the Structure Map via zero or more `Element Links`, which are also associated with a single uniquely identified Record, the attributes of which are separately defined by the Structure Owner.  Structure Maps may also be linked to Elements residing in external Structures via `Structure Links`.

Structure Users are also mapped to objects required for IAM, billing, and feature flagging as typically required in a multi-user SaaS delivery model.

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
# Architecture

```mermaid
graph LR
    subgraph EC2
        subgraph backend
            NestJS
            PrismaORM
            Redis
            Postgres
        end 

        subgraph Integrations
            API("API Key Managment")
            Webhooks
        end 
        
        subgraph frontend
            NextAuthJS
            NextJS
            Redux[Redux Toolkit]
            Tailwind["Tailwind CSS"]
            Markmap
        end
        
        subgraph Security
            Audit
            AccessControl("Access Control")
            OAuth2/JWT
            Encryption
        end
        Git
    end

    Snyk
    Repo["Atlas Repo"]

AccessControl --> NextAuthJS
OAuth2/JWT --> NextAuthJS

NextAuthJS --> NextJS
NextJS --> NestJS

NestJS --> PrismaORM

NestJS --> Redis
PrismaORM --> Postgres

Encryption --> Postgres

Snyk --> Repo
Repo --> Git


```
