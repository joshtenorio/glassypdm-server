# Development
This file will be used for code architecture/planning purposes.

## Development Environment
- minio for s3
- docker container for postgresql database

## System Design
- CAD storage: object storage (e.g. aws s3)
- database: postgresql (managed or not?)
- authentication: oauth ???
- server: digital ocean droplet
- desktop client: tauri app
- web interface: hosted on vercel

## MWE
- [ ] upload/download files
- [ ] identify/increment version number for each file

## v0.1.0 general roadmap
- [ ] open source license
- [ ] dev environment setup guide
- [ ] user authentication
- [ ] user data policy

## v0.1.0 server roadmap
- [ ] identify file conflicts
- [ ] identify/increment version number for each file
- [ ] handle race conditions

## v1.0.0 roadmap
- [ ] web interface
- [ ] contributor code of conduct
- [ ] revert file to previous revision

## strategy
- chunked uploads or pre-signed urls straight to s3?
## Database Schemas
### Project Files
- project id
- file id
- revision number
- number of chunks
### File Chunk
- chunk id
- file id
- chunk link for aws s3
### Project Upload
- project id
- user id
- comment
- project revision base
### Project Users
- project id
- user id
- permission id (none, readonly, read/write, owner, manager)
### Project
- project id
- project name
- update number (project revision number)
### Users
- user id
- things for authentication
## References
- [Dropbox System Design Interview Prep (Youtube)](https://www.youtube.com/watch?v=jLM1nGgsT-I&list=PLPkuArhPxxQGkbl-_STo8FFxBBB4ri-tl&index=5&ab_channel=InterviewPen)
- [relevant tutorial, chunked uploads](https://www.youtube.com/watch?v=dbYBVbrDnwg&ab_channel=CodingWithDawid)
- [multi-part upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html)
- [digital ocean s3/expressjs tutorial](https://www.digitalocean.com/community/tutorials/how-to-upload-a-file-to-object-storage-with-node-js#install-node-js-dependencies)