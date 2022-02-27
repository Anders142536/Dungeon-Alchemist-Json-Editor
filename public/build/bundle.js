
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Import.svelte generated by Svelte v3.46.4 */

    const file$5 = "src/Import.svelte";

    function create_fragment$5(ctx) {
    	let h2;
    	let t1;
    	let div;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Import";
    			t1 = space();
    			div = element("div");
    			add_location(h2, file$5, 5, 0, 32);
    			attr_dev(div, "class", "editor-grid");
    			add_location(div, file$5, 6, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Import', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Import> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Import extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Import",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Export.svelte generated by Svelte v3.46.4 */

    const file$4 = "src/Export.svelte";

    function create_fragment$4(ctx) {
    	let h2;
    	let t1;
    	let div;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Export";
    			t1 = space();
    			div = element("div");
    			add_location(h2, file$4, 4, 0, 31);
    			attr_dev(div, "class", "editor-grid");
    			add_location(div, file$4, 5, 0, 47);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Export', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Export> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Export extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Export",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Settings.svelte generated by Svelte v3.46.4 */

    const file$3 = "src/Settings.svelte";

    function create_fragment$3(ctx) {
    	let h2;
    	let t1;
    	let div;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Settings";
    			t1 = space();
    			div = element("div");
    			add_location(h2, file$3, 5, 0, 32);
    			attr_dev(div, "class", "editor-grid");
    			add_location(div, file$3, 6, 0, 50);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Settings', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Settings",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/LightsEditor.svelte generated by Svelte v3.46.4 */

    const file$2 = "src/LightsEditor.svelte";

    function create_fragment$2(ctx) {
    	let h2;
    	let t1;
    	let div1;
    	let t2;
    	let div0;
    	let t3;
    	let input0;
    	let t4;
    	let input1;
    	let t5;
    	let input2;
    	let t6;
    	let input3;
    	let t7;
    	let input4;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Lights";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Color\n\t");
    			div0 = element("div");
    			t3 = space();
    			input0 = element("input");
    			t4 = text("\n\n\tIntensity\n\t");
    			input1 = element("input");
    			t5 = space();
    			input2 = element("input");
    			t6 = text("\n\n\tRange\n\t");
    			input3 = element("input");
    			t7 = space();
    			input4 = element("input");
    			add_location(h2, file$2, 3, 0, 30);
    			add_location(div0, file$2, 6, 1, 80);
    			attr_dev(input0, "type", "color");
    			add_location(input0, file$2, 7, 1, 88);
    			attr_dev(input1, "type", "range");
    			attr_dev(input1, "min", "0");
    			attr_dev(input1, "max", "1");
    			attr_dev(input1, "step", "0.01");
    			add_location(input1, file$2, 10, 1, 122);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "min", "0");
    			attr_dev(input2, "max", "1");
    			attr_dev(input2, "step", "0.01");
    			add_location(input2, file$2, 11, 1, 172);
    			attr_dev(input3, "type", "range");
    			attr_dev(input3, "min", "0");
    			attr_dev(input3, "max", "1000");
    			attr_dev(input3, "step", "1");
    			add_location(input3, file$2, 14, 1, 231);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "min", "0");
    			attr_dev(input4, "max", "1000");
    			attr_dev(input4, "step", "1");
    			add_location(input4, file$2, 15, 1, 281);
    			attr_dev(div1, "class", "editor-grid");
    			add_location(div1, file$2, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div1, t3);
    			append_dev(div1, input0);
    			append_dev(div1, t4);
    			append_dev(div1, input1);
    			append_dev(div1, t5);
    			append_dev(div1, input2);
    			append_dev(div1, t6);
    			append_dev(div1, input3);
    			append_dev(div1, t7);
    			append_dev(div1, input4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LightsEditor', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LightsEditor> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class LightsEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightsEditor",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/WallsEditor.svelte generated by Svelte v3.46.4 */

    const file$1 = "src/WallsEditor.svelte";

    function create_fragment$1(ctx) {
    	let h2;
    	let t1;
    	let div1;
    	let t2;
    	let div0;
    	let t3;
    	let select;
    	let option0;
    	let option1;
    	let option2;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Walls";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Type\n\t");
    			div0 = element("div");
    			t3 = space();
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "0: Wall";
    			option1 = element("option");
    			option1.textContent = "1: Door";
    			option2 = element("option");
    			option2.textContent = "2: Window";
    			add_location(h2, file$1, 4, 0, 31);
    			add_location(div0, file$1, 7, 1, 79);
    			option0.__value = "0: ";
    			option0.value = option0.__value;
    			add_location(option0, file$1, 9, 2, 98);
    			option1.__value = "1: ";
    			option1.value = option1.__value;
    			add_location(option1, file$1, 10, 2, 137);
    			option2.__value = "2: ";
    			option2.value = option2.__value;
    			add_location(option2, file$1, 11, 2, 176);
    			add_location(select, file$1, 8, 1, 87);
    			attr_dev(div1, "class", "editor-grid");
    			add_location(div1, file$1, 5, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div1, t3);
    			append_dev(div1, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('WallsEditor', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<WallsEditor> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class WallsEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WallsEditor",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let svg;
    	let t0;
    	let div0;
    	let import_1;
    	let t1;
    	let export_1;
    	let t2;
    	let settings;
    	let t3;
    	let div2;
    	let lightseditor;
    	let t4;
    	let wallseditor;
    	let t5;
    	let div1;
    	let input0;
    	let t6;
    	let input1;
    	let current;
    	import_1 = new Import({ $$inline: true });
    	export_1 = new Export({ $$inline: true });
    	settings = new Settings({ $$inline: true });
    	lightseditor = new LightsEditor({ $$inline: true });
    	wallseditor = new WallsEditor({ $$inline: true });

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			t0 = space();
    			div0 = element("div");
    			create_component(import_1.$$.fragment);
    			t1 = space();
    			create_component(export_1.$$.fragment);
    			t2 = space();
    			create_component(settings.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			create_component(lightseditor.$$.fragment);
    			t4 = space();
    			create_component(wallseditor.$$.fragment);
    			t5 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t6 = space();
    			input1 = element("input");
    			attr_dev(svg, "id", "map");
    			add_location(svg, file, 7, 0, 245);
    			attr_dev(div0, "id", "filebar");
    			attr_dev(div0, "class", "interface");
    			add_location(div0, file, 8, 0, 266);
    			attr_dev(input0, "type", "button");
    			input0.value = "Cancel";
    			add_location(input0, file, 18, 2, 446);
    			attr_dev(input1, "type", "button");
    			input1.value = "Save";
    			add_location(input1, file, 19, 2, 485);
    			attr_dev(div1, "class", "button-bar");
    			add_location(div1, file, 17, 1, 419);
    			attr_dev(div2, "id", "inspector");
    			attr_dev(div2, "class", "interface");
    			add_location(div2, file, 14, 0, 346);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			mount_component(import_1, div0, null);
    			append_dev(div0, t1);
    			mount_component(export_1, div0, null);
    			append_dev(div0, t2);
    			mount_component(settings, div0, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(lightseditor, div2, null);
    			append_dev(div2, t4);
    			mount_component(wallseditor, div2, null);
    			append_dev(div2, t5);
    			append_dev(div2, div1);
    			append_dev(div1, input0);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(import_1.$$.fragment, local);
    			transition_in(export_1.$$.fragment, local);
    			transition_in(settings.$$.fragment, local);
    			transition_in(lightseditor.$$.fragment, local);
    			transition_in(wallseditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(import_1.$$.fragment, local);
    			transition_out(export_1.$$.fragment, local);
    			transition_out(settings.$$.fragment, local);
    			transition_out(lightseditor.$$.fragment, local);
    			transition_out(wallseditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			destroy_component(import_1);
    			destroy_component(export_1);
    			destroy_component(settings);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			destroy_component(lightseditor);
    			destroy_component(wallseditor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Import,
    		Export,
    		Settings,
    		LightsEditor,
    		WallsEditor
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
