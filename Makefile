TSC = node_modules/typescript/bin/tsc
EMCC = emcc
OUTDIR = build

all: $(OUTDIR) js wasm html

$(OUTDIR):
	-mkdir $(OUTDIR)

build/digital-fov.js: src/digital-fov.c
	$(EMCC) -o $@ $^ -s EXPORTED_FUNCTIONS='["_digital_los","_digital_fov","_create_array2d","_free_array2d"]' -s WASM=1 -Os

build/digital-fov.wasm: $(OUTDIR)/digital-fov.js

wasm: $(OUTDIR)/digital-fov.wasm

build/%.js: $(wildcard src/*.ts)
	$(TSC) --build src/tsconfig.json

fix_module_names:
	find $(OUTDIR) -name "*.js" -exec awk -i inplace '{if ($$1 == "import" && !/\.js";$$/) gsub(/";/, ".js\";"); print $$0}' {} \;

js: $(OUTDIR)/main.js fix_module_names

build/index.html: src/index.html
	cp $< $@

html: $(OUTDIR)/index.html

clean:
	-rm -r $(OUTDIR)
