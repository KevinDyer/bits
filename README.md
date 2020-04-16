# BITS

* [Quickstart](#quickstart)
  * [Application Arguments](#application-arguments)
  * [Environment Variables](#environment-variables)
* [Modules](#modules)
  * [Available Modules](#available-modules)
  * [Module Basics](#module-basics)
    * [Scopes](#scopes)
    * [Load Policy](#load-policy)
    * [module.json](#modulejson)
    * [index.js](#indexjs)
* [global](#global)
* [APIs](#apis)
* [Helpful Links](#helpful-links)

BITS Integrated Technology System (BITS) is designed for the rapid development of modules that share base software. The goal is to reuse common components in multiple projects and harden these components through extensive use.

BITS can run on enterprise or embedded applications and can help jumpstart a project with initial functionality.

A basic BITS implementation provides the following initial capabilities:

* Module Management
* Inter-module Messaging ([Message Center](https://github.com/LGSInnovations/node-bits-message-center))
* Authorization Scopes

See [Available Modules](#available-modules) for additional capabilities.

## Quickstart

Built the NodeJs framework, BITS requires [NodeJS v12](https://nodejs.org/en/download/).

``` bash
# Download BITS
git clone https://github.com/LGSInnovations/bits.git

# Build
cd bits
npm run build

# Start
npm run dev
```

### Application Arguments

Arg | Description | Default | Example
--- | --- | --- | ---
*d* | Specifiy a path to the data directory. | &lt;projectRoot&gt;/data | `node app.js -d /full/path/to/dir`
*e* | Specifiy an executor type for module execution. Currently supports [cluster](https://nodejs.org/docs/latest-v12.x/api/cluster.html) and [thread](https://nodejs.org/docs/latest-v12.x/api/worker_threads.html) | thread | `node app.js -e process`
*uniform* | Ignore module preferences and use a uniform executor type. | *false* | `node app.js -e process --uniform`
*m* | Specifiy a path to the modules directory. | &lt;dataDir&gt;/base/modules/modules | `node app.js -m /full/path/to/modules`
*o* | Specifiy a path to the log file. | *null* | `node app.js -o /full/path/to/logs`
*v* | Set verbose logging. | *false* | `node app.js -v`

### Environment Variables

Env | Description | Default | Example
--- | --- | --- | ---
*HTTP_PORT* | Specify a port for the HTTP server. | *80* | `HTTP_PORT=9000 node app.js`
*HTTPS_PORT* | Specify a port for the HTTPS server. | *443* | `HTTP_PORT=9001 node app.js`

**Note** BITS does not set up a web server, the [BITS Web Server](https://github.com/LGSInnovations/bits-webserver) module does, however, the environment variable is set through the initial base process.

## Modules

BITS is a framework built around modules. The base BITS framework is made useful with the creation and addition of module functionality. A module should provide a concrete feature to the system.

### Available Modules

* [Authentication](https://github.com/LGSInnovations/bits-authentication)
* [Auth Bearer Strategy](https://github.com/LGSInnovations/bits-auth-bearer)
* [Credentials](https://github.com/LGSInnovations/bits-credentials)
* [Crypto](https://github.com/LGSInnovations/bits-crypto)
* [Google Polymer](https://github.com/LGSInnovations/bits-ui-polymer)
* [Logging Exports](https://github.com/LGSInnovations/bits-logging)
* [MongoDB](https://github.com/LGSInnovations/bits-mongodb)
* [Network Manager](https://github.com/LGSInnovations/bits-network-manager)
* [Node IPC](https://github.com/LGSInnovations/bits-node-ipc)
* [Notifications](https://github.com/LGSInnovations/bits-notifications)
* [Optimized Module Groupings](https://github.com/LGSInnovations/bits-omg)
* [Single Page Application](https://github.com/LGSInnovations/bits-ui-spa)
* [Web Server](https://github.com/LGSInnovations/bits-webserver)
* [Users](https://github.com/LGSInnovations/bits-users)

### Module Basics

#### Scopes

BITS uses an attribute based architecture for access control. Each requester is assigned a set of scopes. The requester is then only able to make requests or receive events that are tagged with the same scope as the request/event is tagged with. Normally, when a request or event listener is added to the message center, the author specifies the scopes attribute in the second parameter.

Notify BITS of your scopes through the module.json.

#### Load Policy

BITS will, by default, attempt to load modules exactly once. If they succeed, the process will continue running until told otherwise. A failure will result in the module not being loaded. Modules may, however, override this behavior by specifying a load policy in the `module.json`.

The load policy is configured by adding a JSON object to the file with the key `load`. This object may contain the following key/value pairs:

* restartPolicy
  * never (DEFAULT)
    * BITS will never re-attempt loading the module
  * oneshot
    * BITS will load the module, but the process will be stopped when it runs to completion
    * If the module load fails, BITS will retry, as specified by the `retries` value
  * on-failure
    * BITS will load the module as usual
    * If the module load fails, BITS will retry, as specified by the `retries` value
* retries
  * The number of times to retry loading
    * Negative numbers will retry indefinitely
    * Default is 1


#### module.json

The module.json defines metadata that will be used by BITS to load your module. Additionally, that metadata will be available on your module's process as `process.env.mod`.

Key | Type | Description
--- | --- | ---
*name* | *String* | A unique name for your module.
*version* | *String* | Semantic Version of your module. Our build process automatically fills in the version based off the specified tag in the repository. You will commonly see this blank, but it should have a value in a production system.
*scopes* | *Array* | Array of scope definitions.
*load* | *Object* | Load Policy.
*executor* | *Object* | Specify the executor type for your module.
*dependencies* | *Object* | A list of dependencies and their versions. Note, use the name of the module from its module.json.

```javascript
// module.json
{
  "name": "my-module",
  "version": "1.2.3",
  "scopes": [{
    "name": "my-module-scopes",
    "displayName": "My Module Scopes"
  },...],
  "dependencies": {
    "bits-base": "^6.0.0",
    "dependency-module": "^1.0.0",
    ...
  }
}
```

```javascript
// module.json with load policy
{
  "name": "my-module",
  "version": "1.2.3",
  "scopes": [{
    "name": "my-module-scopes",
    "displayName": "My Module Scopes"
  },...],
  "load": {
    "restartPolicy": "oneshot",
    "retries": 2
  },
  "dependencies": {
    "bits-base": "^6.0.0",
    "dependency-module": "^1.0.0",
    ...
  }
}
```

```javascript
// module.json with executor type
{
  "name": "my-module",
  "version": "1.2.3",
  "scopes": [{
    "name": "my-module-scopes",
    "displayName": "My Module Scopes"
  },...],
  "executor": {
    "type": "process"
  },
  "dependencies": {
    "bits-base": "^6.0.0",
    "dependency-module": "^1.0.0",
    ...
  }
}
```

#### index.js

An `index.js` needs to be specified to run module code. The `index.js` should export two functions, load and unload. These methods are passed the `messageCenter` for inter-process communication.

```javascript
// index.js
(() => {
  'use strict';

  class MyModule {

    load(messageCenter) {
      return Promise.resolve();
    }

    unload(messageCenter) {
      return Promise.resolve();
    }
  }

  module.exports = new MyModule();
})();
```

When using `oneshot` as the `restartPolicy`, the `load`/`unload` functions should be `static`, and the `index.js` itself should be stateless.

```javascript
// index.js - oneshot reload policy
(() => {
  'use strict';

  class MyModule {
    static load(messageCenter) {
      return Promise.resolve()
      .then(() => {
        // stateless activities
      });
    }

    static unload(messageCenter) {
      return Promise.resolve()
      .then(() => {
        // undo everything, as needed.
      });
    }
  }

  module.exports = MyModule;
})();
```

## global

The `global` object is added to and replicated across all modules. While it makes sense in some scenarios to add to the `global` it is best practice to use the message center to transfer data and make files available for loading. Therefore, the `global` is used sparingly.

**`global.paths`** (*Object*) - file system paths.

Key | Type | Description
--- | --- | ---
*base* | *String* | Absolute path to BITS on the file system.
*data* | *String* | Absolute path to the data directory on the file system.
*modules* | *String* | Absolute path to the modules directory on the file system.
*moduleDataDir* | *String* | Absolute path to your module's directory on the file system.

**`global.bitsId`** (*String*) - the BITS ID of the system. See [bits-id.js](./lib/base/bits-id.js).

**`global.helper`** (*LazyRequireLoader*) - add/remove functionality for key/value. Key is the name of the API being added, and value is the file path.

```javascript
// to add to the helper
global.helper.add('MyClassName', '/path/to/my/class');

// to use the helper in another module
const MyClassName = global.helper.MyClassName;
```

See [lazy-require-loader.js](./lib/utils/lazy-require-loader.js).

## APIs

See the following APIs:

* [Dispatcher](./lib/dispatcher/api.js)
* [Helper](./lib/helper/api.js) - **Note** `add` and `remove` already exist on the `global.helper`, see [global](#global).
* [Modules](./lib/modules/api.js)
* [Scopes](./lib/scopes/api.js)

## Helpful Links

There have been many NPM packages published to remove duplicate code, normalize module structure, and apply tried and true design patterns to a module architecture. Below are regularly maintained BITS repositories.

**Style/Formatting**

* [BITS Style Guide](https://lgsinnovations.github.io/guidelines-bits/styleguide/javascript.html)
* [BITS ESlint Config](https://github.com/LGSInnovations/eslint-config-bits)
* [BITS ESlint](https://github.com/LGSInnovations/node-bits-eslint)

**Helpers**

* [Core](https://github.com/LGSInnovations/node-bits-core)
* [Memory CRUD](https://github.com/LGSInnovations/node-bits-memory-crud)
* [PouchDB CRUD](https://github.com/LGSInnovations/node-bits-pouch-crud)
* [MongoDB CRUD](https://github.com/LGSInnovations/node-bits-mongo-crud)
* [Memory Key/Value](https://github.com/LGSInnovations/node-bits-memory-kv)
* [LevelDB Key/Value](https://github.com/LGSInnovations/node-bits-level-kv)

**Utilities**

* [Message Center](https://github.com/LGSInnovations/node-bits-message-center)
* [Socket.io Client](https://github.com/LGSInnovations/node-bits-socket.io-client)
* [Logger](https://github.com/LGSInnovations/node-bits-logger)
* [Auto Discovery](https://github.com/LGSInnovations/node-bits-auto-discovery)
* [Daemon](https://github.com/LGSInnovations/node-bits-daemon)
* [File System](https://github.com/LGSInnovations/node-bits-fs)
* [Scopes](https://github.com/LGSInnovations/node-bits-scopes-util)
* [Module Lazy Load](https://github.com/LGSInnovations/node-bits-lazy-load)
* [Crypto](https://github.com/LGSInnovations/node-bits-crypto)
