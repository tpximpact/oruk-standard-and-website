---
modified: '2025-06-27T10:00:54.050Z'
---

# Compliance criteria for Open Referral UK

## 1. How to comply with Open Referral UK

There are two main compliance criteria:

- Provide an open API feed that can be accessed by anyone
- Comply with the API specification

Each of these is summarised below.

### 1.1 Provide an open API feed that can be accessed by anyone

Information on services should be freely available for public anonymous access via an Application Programming Interface (API) that returns data in a JavaScript Notation (JSON) format.

To make this API as widely used as possible across platforms, especially simple HTML/JavaScript apps, publishers should implement the following Cross-Origin Resource Sharing (CORS) header on all HTTP responses.

&nbsp;&nbsp;&nbsp;&nbsp;Access-Control-Allow-Origin: \*

Publishers may throttle their web servers to limit excess loads.

Private or confidential information should be excluded from open feeds but may be provided in extra fields via APIs with associated security e.g. with API keys or OAuth security.

### 1.2 Comply with the API specification

The API feed should provide endpoints (also known as “web methods”) that conform to [the API specification](/developers/api).

There are nine endpoints all of which query (that is “GET”) data. We expect the endpoints to:

- be named according to the specification
- use the same query parameters many of which are optional
- provide responses in the JSON format given by the specification

The [Data model](/developers/schemata) page provides a “Schema” for each entity (e.g. [service](/developers/schemata#service)). Within the schema, fields which must be populated are shown as “Required”. So for a service, just these fields must be populated:

- id
- organization_id - linking to the organisation \* providing the service
- name
- status

Note that optional fields without a value should be omitted rather than included with null or empty values.

## 2. The Tool to check compliance (the Validator)

Three of the nine endpoints are most important. These are:

- GET / - giving basic metadata about the API feed
- GET /services - giving a paginated list of services
- GET /services/{id} - giving full details of a single service

[The tool to check compliance](/developers/validator) will consider a feed to “pass” if these three endpoints comply. It will simply “warn” if other endpoints don’t exist or comply. The “Sample reports” on that page show what complies. Take a look at the text at the bottom of the samples (e.g. for [Pass](/developers/validator/edcf9d03-47dd-4c46-833b-e9831d505c72?uri={{API_ENDPOINT_URL}}/api/mock)) for more details.

## 3. Going beyond basic compliance

As data feeds mature and are made more useful they should be extended to:

- increase the number of API endpoints supported
- populate optional data entities and fields
- instigate routine checks on data quality. The [service](/developers/schemata#service) entity has an “assured_date” field which we recommend should be populated with a date less than three months old for each service.

See the [Technical overview to implementing Open Referral UK](/developers/overview) for more information.
