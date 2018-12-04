TSC = node_modules/typescript/bin/tsc
EMCC = emcc
OUTDIR = build

all: spritesheet js wasm html css fonts

$(OUTDIR):
	-mkdir $(OUTDIR)

$(OUTDIR)/digital-fov.js: src/digital-fov.c
	$(EMCC) -o $@ $^ -s EXPORTED_FUNCTIONS='["_digital_los","_digital_fov","_create_array2d","_free_array2d"]' -s WASM=1 -Os

$(OUTDIR)/digital-fov.wasm: $(OUTDIR)/digital-fov.js

wasm: $(OUTDIR) $(OUTDIR)/digital-fov.wasm

$(OUTDIR)/%.js: $(wildcard src/*.ts) $(wildcard src/*/*.ts)
	$(TSC) --build src/tsconfig.json

fix_module_names:
	find $(OUTDIR) -name "*.js" -exec awk -i inplace '{if ($$1 == "import" && !/\.js";$$/) gsub(/";/, ".js\";"); print $$0}' {} \;

js: $(OUTDIR) $(OUTDIR)/main.js fix_module_names

$(OUTDIR)/index.html: src/index.html
	cp $< $@

html: $(OUTDIR) $(OUTDIR)/index.html

$(OUTDIR)/index.css: src/index.css
	cp $< $@

css: $(OUTDIR) $(OUTDIR)/index.css

$(OUTDIR)/spritesheet.gif: resources/sprites.json
	node scripts/gen_spritesheet.js -i $< -o $@

$(OUTDIR)/spritesheet.json: $(OUTDIR)/spritesheet.gif

src/spritesheet.d.ts: resources/sprites.json
	node scripts/gen_spritesheet.js -i $< -t $@

spritesheet: $(OUTDIR) $(OUTDIR)/spritesheet.json src/spritesheet.d.ts

resources/puny8x10.ttf: resources/puny8x10.xcf
	fontmaker $<
	cp resources/puny8x10/puny8x10.ttf resources/
	rm -r resources/puny8x10/

fonts: resources/puny8x10.ttf
	cp $^ $(OUTDIR)

clean:
	-rm -r $(OUTDIR)
	-rm src/spritesheet.d.ts
