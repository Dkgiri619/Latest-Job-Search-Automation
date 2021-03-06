# Latest-Job-Search-Automation

## Automation using puppeteer to ease the headache of job searching

### Functionalities
1. Latest jobs and faster job searching on **glassdoor** and **indeed**.
1. Specify the role and your preferred location and it will extract all the latest data.
1. It provides the role, salary expectations, location of the jobs where you could easily apply.
1. The automation will scrap valuable data and export it into an html so you could directly apply to your preference.
1. It will create a `jobs.json` file to use for further functionalities.

### Requirements
1. `node`
1. `puppeteer`
1. `fs` 

### Implementation
1. Change the role in "searchKeyword" and location at "place" from the `jobSearch.js` file.
2. Run the following commands
  ```bash
    $ npm init -y
    $ npm i puppeteer
    $ node jobSearch.js
  ``` 

