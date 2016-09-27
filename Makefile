#
# Directories
#
ROOT           := $(shell pwd)
NODE_MODULES   := $(ROOT)/node_modules
NODE_BIN       := $(NODE_MODULES)/.bin
TOOLS          := $(ROOT)/tools
TMP            := $(ROOT)/tmp


#
# Tools and binaries
#
ESLINT		:= $(NODE_BIN)/eslint
JSCS		:= $(NODE_BIN)/jscs
MOCHA       := $(NODE_BIN)/mocha
_MOCHA      := $(NODE_BIN)/_mocha
ISTANBUL    := $(NODE_BIN)/istanbul
NSP         := $(NODE_BIN)/nsp
COVERALLS   := $(NODE_BIN)/coveralls
NPM		    := npm
GIT         := git
NSP_BADGE   := $(TOOLS)/nspBadge.js


#
# Directories
#
LIB_FILES  	   := $(ROOT)/lib
TEST_FILES     := $(ROOT)/test
COVERAGE_FILES := $(ROOT)/coverage


#
# Files and globs
#
GIT_HOOK_SRC    = '../../tools/githooks/pre-push'
GIT_HOOK_DEST   = '.git/hooks/pre-push'
SHRINKWRAP     := $(ROOT)/npm-shrinkwrap.json
ALL_FILES      := $(shell find $(LIB_FILES) $(TEST_FILES) -name '*.js' -type f)\
				  $(shell find $(ROOT) -name '*.js' -type f -maxdepth 1)



#
# Targets
#

.PHONY: help
help:
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


.PHONY: all
all: prepush


node_modules: package.json
	@$(NPM) install
	@touch $(NODE_MODULES)


.PHONY: githooks
githooks: ## Install git pre-push hooks.
	@ln -s $(GIT_HOOK_SRC) $(GIT_HOOK_DEST)


.PHONY: lint
lint: node_modules $(ALL_FILES) ## Run lint checker (eslint).
	@$(ESLINT) $(ALL_FILES)


.PHONY: codestyle
codestyle: node_modules $(ALL_FILES) ## Run code style checker (jscs).
	@$(JSCS) $(ALL_FILES)


.PHONY: codestyle-fix
codestyle-fix: node_modules $(ALL_FILES) ## Run code style checker with auto whitespace fixing.
	@$(JSCS) $(ALL_FILES) --fix


.PHONY: nsp
nsp: node_modules $(ALL_FILES) ## Run nsp. Shrinkwraps dependencies, checks for vulnerabilities.
	@$(NPM) shrinkwrap --dev
	@($(NSP) check) | $(NSP_BADGE)
	@rm $(SHRINKWRAP)


.PHONY: prepush
prepush: node_modules lint codestyle coverage nsp ## Git pre-push hook task. Run before committing and pushing.


.PHONY: test
test: node_modules $(ALL_FILES) ## Run unit tests.
	@$(MOCHA) -R spec --full-trace


.PHONY: coverage
coverage: node_modules $(ISTANBUL) $(SRCS) ## Run unit tests with coverage reporting. Generates reports into /coverage.
	@$(ISTANBUL) cover $(_MOCHA) --report lcovonly -- -R spec


.PHONY: report-coverage ## Report unit test coverage to coveralls
report-coverage: coverage
	@cat $(LCOV) | $(COVERALLS)


.PHONY: clean-coverage
clean-coverage:
	@rm -rf $(COVERAGE_FILES)


.PHONY: clean
clean: clean-coverage ## Cleans unit test coverage files and node_modules.
	@rm -rf $(NODE_MODULES)


#
## Debug -- print out a a variable via `make print-FOO`
#
print-%  : ; @echo $* = $($*)

