<a name="5.0.0"></a>
# 5.0.0 (2019-08-14)


### Bug Fixes

* ensure <data-dir>/tmp exists   (110b6d5), closes PNP-1854
* prevent fatal error on load if socket is not fully initialized   (20180e1), closes pnp-2194


### Features

* add in a global path for base so all modules can get running base dir   (dd0a06e)
* add support to export from journalctl   (c1ccb69), closes PNP-1252
* remove OMG subsystem   (805d2c1)


### BREAKING CHANGES

* removes OMG subsystem and ability to upgrade base. See the bits-omg module for continued support of system upgrade.

---

<a name="4.1.0"></a>
# 4.1.0 (2019-06-04)


### Bug Fixes

* **daemon:** emit the 'exit' event   (5574176), closes PNP-1745


### Features

* adds origin to message center metadata   (e06bd86), closes PNP-1705

---

<a name="4.0.0"></a>
# 4.0.0 (2019-05-24)


### Bug Fixes

* Allow routes to be added when classes extend base crud router   (4f3f1a8), closes BITS-255
* bind to module to prevent deletion race condition   (f9d93b3), closes PNP-1573
* changes to readstream API   (40e48ba)
* correctly compare scopes with development scope   (85ce91f), closes PNP-1389
* default undefined arguments in crud-api to be empty objects   (c914a6b), closes PNP-118
* delete the correct module on exit   (a488c90), closes PNP-1322 PNP-1407
* do not overwrite load error if one exists   (332cfce), closes PNP-1587
* fix upgrade-base for node10   (e278ef7)
* log messages fail to be properly parsed   (3721926), closes PNP-1605
* remove additional endpoints for delete   (eda498f), closes PNP-1356
* send signal to process.kill() to determine how process was killed   (31f3ceb), closes PNP-1429
* **logger:** format the logger output to the file for human-readability   (07674e3), closes PNP-1532
* winston splat handler   (3cf9438)
* winston work-around for logging with 2 args   (dd4d100)


### Features

* add API to retrieve display name for a module   (1d5b631), closes PNP-1388
* adds root router resource listener to base server   (f3336c5), closes PNP-1485
* event listeners on workers   (db3fd5f), closes PNP-1573 PNP-1562
* remove endpoint in helper API   (8db0cbd), closes PNP-1293
* **certificate:** add trusted ca and api to get trusted ca   (097f61c), closes GARB-483
* **certificate/key:** add cert & key classes to utils   (99ff86a), closes BITS-248 GARB-534
* **load-policy:** add load policy to allow modules to specify how the process should be maintained/   (96e8c36), closes PNP-1322
* remove public scope   (c8a0f17)
* removes web based user interface   (aff7617), closes PNP-1268
* update node dependencies   (688472e), closes BITS-197
* winston 3.x.x upgrade   (4479de2), closes BITS-198


### BREAKING CHANGES

* remove "public" scope; the motivation being that everyone gets
	the public scope, so why bother?

	Before:
	scopes: ['public']

	After:
	scopes: []
* newer NPM dependencies will no longer work in node 6
* removes all Polymer elements and API's for pages, gallery,
toolbar, and widgets

---

<a name="3.5.0"></a>
# 3.5.0 (2019-04-10)


### Bug Fixes

* allow bits to run from any directory   (44f9a0f)
* allow upgrade scripts to run without progress server   (c1e3e9f), closes BITS-157
* assign value to the correct property   (ba8c3f9), closes NMON-432
* **activities:** require user interaction to dismiss notifications   (c94c410), closes PNP-1271
* **OmgApi:** resolve add() once complete   (fa7a243), closes EDG-68
* **routers:** fix body parsing for all CRUD routers   (4c1da42), closes PNP-113
* **upgrade-server:** Upgrade server should not wait for server connection   (cd08d3e), closes PNP-587
* check error against "not found" regex   (aacf8f8), closes GARB-605
* create a module dir in tmp for unit tests   (36f9595), closes PNP-822
* ensure childProcess object exists before calling kill on it   (5c03c83)
* PouchDB _id initialize   (ee03444), closes PNP-903
* toolbar items observer listens on length changes   (85bbcaa), closes PNP-885


### Features

* **display-name:** add behavior to pull display name from module.json   (6eea18a), closes PNP-580
* **OmgsApi:** expose delete   (9561384), closes EDG-67
* Add a field to the child process utility to pass stdin to the process   (cd2be64), closes PNP-1116
* Add a symlink wrapper to the UtilFs utility   (ba8285f), closes PNP-1116
* expose BaseOmgsApi   (6faad49), closes EDG-64
* make modules dir a configurable option on the command line   (56082d6), closes BITS-163

---

<a name="3.5.0"></a>
# [3.5.0] (2019-04-05)


### Bug Fixes

* allow bits to run from any directory (44f9a0f)
* allow upgrade scripts to run without progress server (c1e3e9f), closes BITS-157
* assign value to the correct property (ba8c3f9), closes NMON-432
* **OmgApi:** resolve add() once complete (fa7a243), closes EDG-68
* **routers:** fix body parsing for all CRUD routers (4c1da42), closes PNP-113
* **upgrade-server:** Upgrade server should not wait for server connection (cd08d3e), closes PNP-587
* check error against "not found" regex (aacf8f8), closes GARB-605
* create a module dir in tmp for unit tests (36f9595), closes PNP-822
* ensure childProcess object exists before calling kill on it (5c03c83)
* PouchDB _id initialize (ee03444), closes PNP-903
* toolbar items observer listens on length changes (85bbcaa), closes PNP-885


### Features

* **display-name:** add behavior to pull display name from module.json (6eea18a), closes PNP-580
* **OmgsApi:** expose delete (9561384), closes EDG-67
* Add a field to the child process utility to pass stdin to the process (cd2be64), closes PNP-1116
* Add a symlink wrapper to the UtilFs utility (ba8285f), closes PNP-1116
* expose BaseOmgsApi (6faad49), closes EDG-64
* make modules dir a configurable option on the command line (56082d6), closes BITS-163

---

<a name="3.4.0"></a>
# 3.4.0 (2019-01-21)


### Bug Fixes

* **auth:** retrieve a user object for any registered authentication strategy   (58e8042), closes BITS-246
* **key-manager:** handle symlinks when reading keys from directory   (188f317), closes BITS-188
* **lib:** module load fix and error handling. Daemon error handling.   (0cc9a05), closes BITS-194 BITS-191
* **module_load:** make dependency errors useful   (e6f215a), closes BITS-244
* **navigation:** listen for route changes and handle loading of default page   (2d52d5b), closes NMON-432
* **page-validation:** validate default pages fully to add priority when missing   (58135b2), closes BITS-238
* assign value to the correct property   (33f2959), closes NMON-432
* gallery category sort "Home" to top of list   (42396b3), closes BITS-189
* pages priority override   (2f46020), closes BITS-190


### Features

* **auth-strategies:** allow additional authentication strategies to be registered and used   (04f3d7c), closes BITS-192
* add icon to header layout   (c8f4bae), closes BITS-250

---

<a name="3.3.0"></a>
# 3.3.0 (2018-11-07)


### Bug Fixes

* **crud-routes:** fix query param retrieval on CRUD routes   (0d3f235), closes BITS-177
* **modules-scope:** hide the modules page based on scopes   (e50f8f7), closes BITS-175
* **router-params:** fix router params for list query/options   (6bcb214), closes BITS-177
* chrome notifications appear correctly   (8b747ab)
* throttled log dumps, catch error on attempting to encrypt deleted file   (c26f7fc), closes BITS-185


### Features

* Sort the scopes list alphabetically   (7f79827), closes BITS-172
* **scoped-notifications:** add filtering for listing activity logs based on user scopes   (62fe159), closes BITS-176

---

<a name="3.2.0"></a>
# 3.2.0 (2018-10-15)


### Bug Fixes

* Firefox sidenav toggle   (cf6ed8b), closes BITS-170
* Fix the undefined variable error in Pages Manager when a resource is removed   (3cb3948), closes BITS-171
* more customizeable base-header-layout   (41df7a6) 


### Features

* Moment system time offset   (3f4a410)
* **priority-notifications:** allow notifications to pop up a modal or toast   (bc4dba7)

---

<a name="3.1.0"></a>
# 3.1.0 (2018-09-20)


### Bug Fixes

* no horizontal scrolling, correct query selector sizes   (999529c), closes BITS-159
* race condition mitigated. Failure does not stop all UI loading.   (186c954), closes BITS-156
* **custom-pages:** return to same page upon refresh   (801bd10), closes BITS-166
* **page-order:** fix ordering of incoming pages   (854d9bb)


### Features

* **pages-manager:** add ability for modules to override/extend a module's pages   (6924bbc), closes BITS-151

---

<a name="3.0.1"></a>
## 3.0.1 (2018-08-14)


### Bug Fixes

* **crud-router-get:** fix get for CrudRouter silently failing   (b481ed0), closes BITS-145
* widget loading, toolbar loading, socket fixes   (5594dc8), closes BITS-153 BITS-80

---

<a name="3.0.0"></a>
# 3.0.0 (2018-08-10)


### Bug Fixes

* **activity-cleanup:** prevent unhandled rejection on activity cleanup   (1d00aaf)
* Load modules that do not define scopes   (1c2cf9b), closes BITS-134
* **missing-arg:** fix missing arg causing error   (24b4d5d)
* **missing-arg:** fix missing arg causing error   (29060f7)
* added logger to the upgrade manager   (0432848)
* Address a race condition between modules and helpers   (0d8b285), closes BSUM-58
* Dependency version check   (c5767b6), closes BITS-143
* Fix an issue when the module can not load   (ae5de8b)
* fix lazy-load and test linter   (e5708e6)
* fix race condition in adding APIs   (1024b10), closes BSUM-58
* Fixed spelling in a comment   (fa2c76a), closes BITS-126
* load issues fixed for 3.0   (6f78976), closes BITS-139
* mobile fixes and import fixes   (581ee56)
* Null check on socket disconnect   (3c21a62), closes BSUM-68
* scopes must be an array   (aa2db70), closes bits-134
* Ui supports module management features   (fa032cf)
* updated toolbar to work with the new format   (73baca4)
* **scopes-firefox:** fix inability to change user scopes in Firefox   (8075941), closes BITS-34
* Upgrade server minimist dependency   (3866be9), closes BITS-144
* use async for import   (78bd74d)
* **module-manager:** fix when module would crash it would get removed from the system   (f38bf88), closes BITS-127
* **npm-path:** fix path for node package   (9ce9525)
* **npm-path:** fix path for node package   (59a3033)
* **scopes:** use the proper scopes   (a1a91b7)
* **user-create:** fix non-scrolling page for user creation   (90d7e65), closes BITS-137


### Code Refactoring

* (Module Manager)   (aef8289), closes BITS-121 BITS-120


### Features

* **link:** add link function   (a9a71f7)
* **link:** add link function   (964ffba)
* Adds upgrade logs to log bundle   (97cd0f0), closes BITS-128
* **modules-loaded-event:** add event for when modules have finished loading   (4d1dce2)
* **upgrade-script:** run all upgrade scripts from tmp   (f6a4a97)


### BREAKING CHANGES

* refactor of the module management subsystem to use CRUD. Old events are removed and the api has been simplified

---

<a name="2.20.1"></a>
## 2.20.1 (2018-07-10)


### Bug Fixes

* **scopes-firefox:** fix inability to change user scopes in Firefox   (00f03c7), closes BITS-34
* **upgrade-script:** copy pre-populated module data to the correct location   (6297ad3), closes BITS-135

---

<a name="2.20.0"></a>
# 2.20.0 (2018-05-29)


### Bug Fixes

* **browser:** Check that object is defined before accessing properties   (eb4df49)
* add null checks for process members   (7a158a2), closes BITS-115
* **upgrade:** Ensure file removal is complete   (b720071), closes BITS-117
* **upgrade:** Moving directory vs directory contents, delete modules   (96f3b33)
* **upgrade:** Removes mini-message-center and base-load-url   (adf6d31)
* **upgrade_rmrf:** Fix rm -rf to use spawn   (ce8f4f0)
* Client reload on upgrade start event and socket null   (3e0fc82)
* fix keys and values call for Persistent KV   (39f8d9f)
* fix merge conflict resolution that copied wrong line   (c4e081c), closes BITS-109 BITS-117
* Module count should be based on the extracted dir   (04d2f51)


### Features

* add utility method for mkdirp   (81a847c)
* add utility method for mkdirp   (a7af61a)
* add which to util-fs   (313f9ba)
* Moved node module requires specific load methods   (8959298)
* **upgrade:** Show upgrade errors in the OMGs UI   (5b165ba), closes BITS-109 BITS-110 BITS-111 BITS-112 BITS-113
* **upgrade-server:** Initial commit of Upgrade Server   (fe235c6), closes BITS-93 BITS-94 BITS-95
* remove the username from the bottom and always display it in toolbar   (ec4f555), closes BITS-27

---

<a name="2.19.0"></a>
# 2.19.0 (2018-03-26)


### Bug Fixes

* **browser:** fix behavior context   (35e9f47)
* **browser:** fix behavior context   (812b007)
* **browser:** Missing shared style import   (d545151), closes BITS-100
* **modules:** bits base shows loaded   (37c1770), closes BITS-88
* **var-name:** send correct result   (12eb3bf)
* **var-name:** send correct result   (b83f2ad)


### Features

* **browser:** implement base-layout   (326004e)
* **browser:** shared styles and behavior   (0e99583)
* **browser:** style override   (117c80a)
* **crud-router:** add crud-router base class with setup via crud-manager   (ddd1de1), closes BITS-89
* **crud-router:** add crud-router base class with setup via crud-manager   (4f7c549), closes BITS-89
* **crud-router:** add crud-router base class with setup via crud-manager   (136b620), closes BITS-89
* can remove sensors   (b7278e9)
* loading base will reject if something goes wrong   (56bdfb1)


### Reverts

* **browser): revert refactor(browser:** remove unused props   (bf4376d)

---

<a name="2.18.0"></a>
# 2.18.0 (2018-02-28)


### Features

* **server:** disable setTime request handler   (0918eba), closes BITS-98

---

<a name="2.17.2"></a>
## 2.17.2 (2018-02-21)


### Bug Fixes

* fixes issue where module crashes during load   (6914af6), closes BITS-79
* **browser:** getDistributedNodes deprecated in Firefox Quantum   (eb17ad6)

---

<a name="2.17.1"></a>
## 2.17.1 (2018-02-12)


### Bug Fixes

* **browser:** vaadin-grid-sorter order   (e1b1265)

---

<a name="2.17.0"></a>
# 2.17.0 (2018-02-01)


### Bug Fixes

* backend list gets all data for users   (88ad29d)


### Features

* added ability to manually add a proxy path   (8bbaece)

---

<a name="2.16.0"></a>
# 2.16.0 (2018-01-12)


### Bug Fixes

* fix ReferenceError that results from an uncaughtException   (25d44c0)
* make stdout/stderr available on non-0 exit code   (3f1d92c)


### Features

* **client:** Vaadin Grid column behavior.   (8cf0d0d)
* add bits-crypto module   (e28abd5)
* add santize item to pouch operations   (030884e)
* **manager-state-listener:** add manager state changed listener to module-api   (fea575d)
* Adds column width and default setting of widths   (1538168)
* use Decrypter to decrypt files   (3de8b85)
* use Encrypter to encrypt   (ca405ac)

---

<a name="2.15.0"></a>
# 2.15.0 (2018-01-04)


### Bug Fixes

* **chain-failure:** prevent one failed operation from ruining it for the rest   (9182aaf), closes BITS-73
* **clear-activities:** fix dismiss all button not working   (9814ecf), closes BITS-73


### Features

* allow BaseServer helper to start web server on any port   (4575082)

---

<a name="2.14.0"></a>
# 2.14.0 (2017-11-29)


### Bug Fixes

* **activity-creation:** chain creation of activities to avoid creating in the same millisecond   (3bcc22f)
* **client:** add month and day to activity timestamp   (cdd01a5)
* **client:** handle no displayName and sort ignoring case   (e17adb6)
* **client:** sort by display name   (0df112f)
* **daemon:** add kill method to daemon helper   (536a143)
* **remove-listeners:** fix method signature and logic to handle scopes being passed in   (d30585c), closes BITS-65
* **remove-middleware:** fix issue with removing middleware   (2fbf5db), closes BITS-64
* **server:** report module installation path   (0df9612)


### Features

* create promise-ified exec() from child-process   (433cce2)

---

<a name="2.13.0"></a>
# 2.13.0 (2017-11-11)


### Bug Fixes

* allow modules to subscribe to event listeners   (51ab538)
* Long titles will be capped with an ellipsis to make room for sibling elements.   (fe1b315)
* **client:** sort modules alphabetically   (af46cd3), closes BITS-62
* **server:** fix user id for proxy request   (a77ab7f), closes BITS-60


### Features

* **backend:** add PouchDB crud manager   (54eebf5)
* **polymer-element:** Adds new base-moment element   (d0d97cc)

---

<a name="2.12.0"></a>
# 2.12.0 (2017-10-27)


### Bug Fixes

* **backend:** Add PersistentKeyValue helpers   (3078c2c)
* **backend:** Allow omgs with no version string   (7be425c), closes BITS-51
* **backend:** async sanitize activities database   (710e68c), closes BITS-50
* **backend:** Return null instead of module info from unloadModule   (910a3b7), closes BITS-52
* **crud:** fix missing CRUD updates   (b724b07), closes BITS-47
* **test:** Remove unused tests and fixtures   (e36fb41), closes BITS-56
* **ui:** add path to BaseDynamicElements   (233605d)
* fix isBaseAllowed test logic   (a7a6ccf), closes bits-59
* make the BITS id generator portable to systems without hostname command   (26b0f91), closes #19
* **vaadin-multi-select-behavior:** notify changes to hasSelectedItems   (91aa76a)
* notify user on no public key when generating crash dump   (516df3d)


### Features

* **backend:** Add persistent key-value storage   (425575b)
* **frontend:** Add settings for activity limit   (c6f6432)

---

<a name="2.11.0"></a>
# 2.11.0 (2017-10-12)


### Bug Fixes

* **omgs-manager:** allow OMGs to upgrade/downgrade as long as new base version is not 1.x.y   (3c24b3c), closes BITS-49


### Features

* made base-lazy-element safe when page is an empty object   (4090e7c), closes #21

---

<a name="2.10.1"></a>
## 2.10.1 (2017-10-11)


### Bug Fixes

* fix daemon helper cleanup   (ab32239)
* fix unload not passing message center   (9b603a3)
* **$modules:** fix module loading to support release candidates   (ec26293)
* **crud:** fix missing CRUD updates   (e4a5ce2), closes BITS-47
* **crud:** fix some missed emit calls to use arrays   (5ccd131), closes BITS-47

---

<a name="2.10.1"></a>
## 2.10.1 (2017-10-11)


### Bug Fixes

* fix daemon helper cleanup   (ab32239)
* fix unload not passing message center   (9b603a3)
* **$modules:** fix module loading to support release candidates   (ec26293)
* **crud:** fix missing CRUD updates   (e4a5ce2), closes BITS-47
* **crud:** fix some missed emit calls to use arrays   (5ccd131), closes BITS-47

---

<a name="2.10.0"></a>
#
2.10.0 (2017-10-04)


### Bug Fixes

* **build:** Use the new build pre package step   (9d8b23b)


### Features

* **$browser:** adds helper class to browser to aid dynaimc element lists   (71c06fa)

