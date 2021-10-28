
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
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
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_options(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            option.selected = ~value.indexOf(option.__value);
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function select_multiple_value(select) {
        return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
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
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.2' }, detail)));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
        };
    }
    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }
    function draw(node, { delay = 0, speed, duration, easing = cubicInOut }) {
        const len = node.getTotalLength();
        if (duration === undefined) {
            if (speed === undefined) {
                duration = 800;
            }
            else {
                duration = len / speed;
            }
        }
        else if (typeof duration === 'function') {
            duration = duration(len);
        }
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
        };
    }
    function crossfade(_a) {
        var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
        const to_receive = new Map();
        const to_send = new Map();
        function crossfade(from, node, params) {
            const { delay = 0, duration = d => Math.sqrt(d) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
            const to = node.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const dw = from.width / to.width;
            const dh = from.height / to.height;
            const d = Math.sqrt(dx * dx + dy * dy);
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            const opacity = +style.opacity;
            return {
                delay,
                duration: is_function(duration) ? duration(d) : duration,
                easing,
                css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
            };
        }
        function transition(items, counterparts, intro) {
            return (node, params) => {
                items.set(params.key, {
                    rect: node.getBoundingClientRect()
                });
                return () => {
                    if (counterparts.has(params.key)) {
                        const { rect } = counterparts.get(params.key);
                        counterparts.delete(params.key);
                        return crossfade(rect, node, params);
                    }
                    // if the node is disappearing altogether
                    // (i.e. wasn't claimed by the other list)
                    // then we need to supply an outro
                    items.delete(params.key);
                    return fallback && fallback(node, params, intro);
                };
            };
        }
        return [
            transition(to_send, to_receive, false),
            transition(to_receive, to_send, true)
        ];
    }

    var transitions = /*#__PURE__*/Object.freeze({
        __proto__: null,
        blur: blur,
        crossfade: crossfade,
        draw: draw,
        fade: fade,
        fly: fly,
        scale: scale,
        slide: slide
    });

    /* node_modules/svelma/src/components/Icon.svelte generated by Svelte v3.31.2 */

    const file = "node_modules/svelma/src/components/Icon.svelte";

    function create_fragment(ctx) {
    	let span;
    	let i;
    	let i_class_value;
    	let span_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			attr_dev(i, "class", i_class_value = "" + (/*newPack*/ ctx[8] + " fa-" + /*icon*/ ctx[0] + " " + /*customClass*/ ctx[2] + " " + /*newCustomSize*/ ctx[6]));
    			add_location(i, file, 53, 2, 1189);
    			attr_dev(span, "class", span_class_value = "icon " + /*size*/ ctx[1] + " " + /*newType*/ ctx[7] + " " + (/*isLeft*/ ctx[4] && "is-left" || "") + " " + (/*isRight*/ ctx[5] && "is-right" || ""));
    			toggle_class(span, "is-clickable", /*isClickable*/ ctx[3]);
    			add_location(span, file, 52, 0, 1046);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*newPack, icon, customClass, newCustomSize*/ 325 && i_class_value !== (i_class_value = "" + (/*newPack*/ ctx[8] + " fa-" + /*icon*/ ctx[0] + " " + /*customClass*/ ctx[2] + " " + /*newCustomSize*/ ctx[6]))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*size, newType, isLeft, isRight*/ 178 && span_class_value !== (span_class_value = "icon " + /*size*/ ctx[1] + " " + /*newType*/ ctx[7] + " " + (/*isLeft*/ ctx[4] && "is-left" || "") + " " + (/*isRight*/ ctx[5] && "is-right" || ""))) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*size, newType, isLeft, isRight, isClickable*/ 186) {
    				toggle_class(span, "is-clickable", /*isClickable*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
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
    	let newPack;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, []);
    	let { type = "" } = $$props;
    	let { pack = "fas" } = $$props;
    	let { icon } = $$props;
    	let { size = "" } = $$props;
    	let { customClass = "" } = $$props;
    	let { customSize = "" } = $$props;
    	let { isClickable = false } = $$props;
    	let { isLeft = false } = $$props;
    	let { isRight = false } = $$props;
    	let newCustomSize = "";
    	let newType = "";

    	const writable_props = [
    		"type",
    		"pack",
    		"icon",
    		"size",
    		"customClass",
    		"customSize",
    		"isClickable",
    		"isLeft",
    		"isRight"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(9, type = $$props.type);
    		if ("pack" in $$props) $$invalidate(10, pack = $$props.pack);
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("customClass" in $$props) $$invalidate(2, customClass = $$props.customClass);
    		if ("customSize" in $$props) $$invalidate(11, customSize = $$props.customSize);
    		if ("isClickable" in $$props) $$invalidate(3, isClickable = $$props.isClickable);
    		if ("isLeft" in $$props) $$invalidate(4, isLeft = $$props.isLeft);
    		if ("isRight" in $$props) $$invalidate(5, isRight = $$props.isRight);
    	};

    	$$self.$capture_state = () => ({
    		type,
    		pack,
    		icon,
    		size,
    		customClass,
    		customSize,
    		isClickable,
    		isLeft,
    		isRight,
    		newCustomSize,
    		newType,
    		newPack
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(9, type = $$props.type);
    		if ("pack" in $$props) $$invalidate(10, pack = $$props.pack);
    		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("customClass" in $$props) $$invalidate(2, customClass = $$props.customClass);
    		if ("customSize" in $$props) $$invalidate(11, customSize = $$props.customSize);
    		if ("isClickable" in $$props) $$invalidate(3, isClickable = $$props.isClickable);
    		if ("isLeft" in $$props) $$invalidate(4, isLeft = $$props.isLeft);
    		if ("isRight" in $$props) $$invalidate(5, isRight = $$props.isRight);
    		if ("newCustomSize" in $$props) $$invalidate(6, newCustomSize = $$props.newCustomSize);
    		if ("newType" in $$props) $$invalidate(7, newType = $$props.newType);
    		if ("newPack" in $$props) $$invalidate(8, newPack = $$props.newPack);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*pack*/ 1024) {
    			 $$invalidate(8, newPack = pack || "fas");
    		}

    		if ($$self.$$.dirty & /*customSize, size*/ 2050) {
    			 {
    				if (customSize) $$invalidate(6, newCustomSize = customSize); else {
    					switch (size) {
    						case "is-small":
    							break;
    						case "is-medium":
    							$$invalidate(6, newCustomSize = "fa-lg");
    							break;
    						case "is-large":
    							$$invalidate(6, newCustomSize = "fa-3x");
    							break;
    						default:
    							$$invalidate(6, newCustomSize = "");
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*type*/ 512) {
    			 {
    				if (!type) $$invalidate(7, newType = "");
    				let splitType = [];

    				if (typeof type === "string") {
    					splitType = type.split("-");
    				} else {
    					for (let key in type) {
    						if (type[key]) {
    							splitType = key.split("-");
    							break;
    						}
    					}
    				}

    				if (splitType.length <= 1) $$invalidate(7, newType = ""); else $$invalidate(7, newType = `has-text-${splitType[1]}`);
    			}
    		}
    	};

    	return [
    		icon,
    		size,
    		customClass,
    		isClickable,
    		isLeft,
    		isRight,
    		newCustomSize,
    		newType,
    		newPack,
    		type,
    		pack,
    		customSize,
    		click_handler
    	];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			type: 9,
    			pack: 10,
    			icon: 0,
    			size: 1,
    			customClass: 2,
    			customSize: 11,
    			isClickable: 3,
    			isLeft: 4,
    			isRight: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[0] === undefined && !("icon" in props)) {
    			console.warn("<Icon> was created without expected prop 'icon'");
    		}
    	}

    	get type() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pack() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pack(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customClass() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customClass(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customSize() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customSize(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isClickable() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isClickable(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isLeft() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isLeft(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isRight() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isRight(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function chooseAnimation(animation) {
      return typeof animation === 'function' ? animation : transitions[animation]
    }

    function isDeleteKey(e) {
      return e.keyCode && e.keyCode === 46
    }

    function isEscKey(e) {
      return e.keyCode && e.keyCode === 27
    }

    function omit(obj, ...keysToOmit) {
      return Object.keys(obj).reduce((acc, key) => {
        if (keysToOmit.indexOf(key) === -1) acc[key] = obj[key];
        return acc
      }, {})
    }

    function typeToIcon(type) {
      switch (type) {
        case 'is-info':
          return 'info-circle'
        case 'is-success':
          return 'check-circle'
        case 'is-warning':
          return 'exclamation-triangle'
        case 'is-danger':
          return 'exclamation-circle'
        default:
          return null
      }
    }

    function getEventsAction(component) {
      return node => {
        const events = Object.keys(component.$$.callbacks);
        const listeners = [];
        events.forEach(event =>
          listeners.push(listen(node, event, e => bubble(component, e)))
        );
        return {
          destroy: () => {
            listeners.forEach(listener => listener());
          }
        };
      };
    }

    /* node_modules/svelma/src/components/Button.svelte generated by Svelte v3.31.2 */

    const { Error: Error_1 } = globals;
    const file$1 = "node_modules/svelma/src/components/Button.svelte";

    // (85:22) 
    function create_if_block_3(ctx) {
    	let a;
    	let t0;
    	let span;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*iconLeft*/ ctx[7] && create_if_block_5(ctx);
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);
    	let if_block1 = /*iconRight*/ ctx[8] && create_if_block_4(ctx);
    	let a_levels = [{ href: /*href*/ ctx[1] }, /*props*/ ctx[11]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			span = element("span");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			add_location(span, file$1, 96, 4, 2314);
    			set_attributes(a, a_data);
    			toggle_class(a, "is-inverted", /*inverted*/ ctx[4]);
    			toggle_class(a, "is-loading", /*loading*/ ctx[3]);
    			toggle_class(a, "is-outlined", /*outlined*/ ctx[5]);
    			toggle_class(a, "is-rounded", /*rounded*/ ctx[6]);
    			add_location(a, file$1, 85, 2, 2047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if (if_block0) if_block0.m(a, null);
    			append_dev(a, t0);
    			append_dev(a, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			append_dev(a, t1);
    			if (if_block1) if_block1.m(a, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler_1*/ ctx[17], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*iconLeft*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*iconLeft*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(a, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, null, null);
    				}
    			}

    			if (/*iconRight*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*iconRight*/ 256) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(a, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 2) && { href: /*href*/ ctx[1] },
    				dirty & /*props*/ 2048 && /*props*/ ctx[11]
    			]));

    			toggle_class(a, "is-inverted", /*inverted*/ ctx[4]);
    			toggle_class(a, "is-loading", /*loading*/ ctx[3]);
    			toggle_class(a, "is-outlined", /*outlined*/ ctx[5]);
    			toggle_class(a, "is-rounded", /*rounded*/ ctx[6]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(85:22) ",
    		ctx
    	});

    	return block;
    }

    // (66:0) {#if tag === 'button'}
    function create_if_block(ctx) {
    	let button;
    	let t0;
    	let span;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*iconLeft*/ ctx[7] && create_if_block_2(ctx);
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);
    	let if_block1 = /*iconRight*/ ctx[8] && create_if_block_1(ctx);
    	let button_levels = [/*props*/ ctx[11], { type: /*nativeType*/ ctx[2] }];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			span = element("span");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			add_location(span, file$1, 77, 4, 1882);
    			set_attributes(button, button_data);
    			toggle_class(button, "is-inverted", /*inverted*/ ctx[4]);
    			toggle_class(button, "is-loading", /*loading*/ ctx[3]);
    			toggle_class(button, "is-outlined", /*outlined*/ ctx[5]);
    			toggle_class(button, "is-rounded", /*rounded*/ ctx[6]);
    			add_location(button, file$1, 66, 2, 1599);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block0) if_block0.m(button, null);
    			append_dev(button, t0);
    			append_dev(button, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			append_dev(button, t1);
    			if (if_block1) if_block1.m(button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[16], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*iconLeft*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*iconLeft*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(button, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16384) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, null, null);
    				}
    			}

    			if (/*iconRight*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*iconRight*/ 256) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(button, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				dirty & /*props*/ 2048 && /*props*/ ctx[11],
    				(!current || dirty & /*nativeType*/ 4) && { type: /*nativeType*/ ctx[2] }
    			]));

    			toggle_class(button, "is-inverted", /*inverted*/ ctx[4]);
    			toggle_class(button, "is-loading", /*loading*/ ctx[3]);
    			toggle_class(button, "is-outlined", /*outlined*/ ctx[5]);
    			toggle_class(button, "is-rounded", /*rounded*/ ctx[6]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(66:0) {#if tag === 'button'}",
    		ctx
    	});

    	return block;
    }

    // (94:4) {#if iconLeft}
    function create_if_block_5(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				pack: /*iconPack*/ ctx[9],
    				icon: /*iconLeft*/ ctx[7],
    				size: /*iconSize*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconPack*/ 512) icon_changes.pack = /*iconPack*/ ctx[9];
    			if (dirty & /*iconLeft*/ 128) icon_changes.icon = /*iconLeft*/ ctx[7];
    			if (dirty & /*iconSize*/ 1024) icon_changes.size = /*iconSize*/ ctx[10];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(94:4) {#if iconLeft}",
    		ctx
    	});

    	return block;
    }

    // (100:4) {#if iconRight}
    function create_if_block_4(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				pack: /*iconPack*/ ctx[9],
    				icon: /*iconRight*/ ctx[8],
    				size: /*iconSize*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconPack*/ 512) icon_changes.pack = /*iconPack*/ ctx[9];
    			if (dirty & /*iconRight*/ 256) icon_changes.icon = /*iconRight*/ ctx[8];
    			if (dirty & /*iconSize*/ 1024) icon_changes.size = /*iconSize*/ ctx[10];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(100:4) {#if iconRight}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if iconLeft}
    function create_if_block_2(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				pack: /*iconPack*/ ctx[9],
    				icon: /*iconLeft*/ ctx[7],
    				size: /*iconSize*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconPack*/ 512) icon_changes.pack = /*iconPack*/ ctx[9];
    			if (dirty & /*iconLeft*/ 128) icon_changes.icon = /*iconLeft*/ ctx[7];
    			if (dirty & /*iconSize*/ 1024) icon_changes.size = /*iconSize*/ ctx[10];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(75:4) {#if iconLeft}",
    		ctx
    	});

    	return block;
    }

    // (81:4) {#if iconRight}
    function create_if_block_1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: {
    				pack: /*iconPack*/ ctx[9],
    				icon: /*iconRight*/ ctx[8],
    				size: /*iconSize*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_changes = {};
    			if (dirty & /*iconPack*/ 512) icon_changes.pack = /*iconPack*/ ctx[9];
    			if (dirty & /*iconRight*/ 256) icon_changes.icon = /*iconRight*/ ctx[8];
    			if (dirty & /*iconSize*/ 1024) icon_changes.size = /*iconSize*/ ctx[10];
    			icon.$set(icon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(81:4) {#if iconRight}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_if_block_3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tag*/ ctx[0] === "button") return 0;
    		if (/*tag*/ ctx[0] === "a") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let props;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { tag = "button" } = $$props;
    	let { type = "" } = $$props;
    	let { size = "" } = $$props;
    	let { href = "" } = $$props;
    	let { nativeType = "button" } = $$props;
    	let { loading = false } = $$props;
    	let { inverted = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { iconLeft = null } = $$props;
    	let { iconRight = null } = $$props;
    	let { iconPack = null } = $$props;
    	let iconSize = "";

    	onMount(() => {
    		if (!["button", "a"].includes(tag)) throw new Error(`'${tag}' cannot be used as a tag for a Bulma button`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("tag" in $$new_props) $$invalidate(0, tag = $$new_props.tag);
    		if ("type" in $$new_props) $$invalidate(12, type = $$new_props.type);
    		if ("size" in $$new_props) $$invalidate(13, size = $$new_props.size);
    		if ("href" in $$new_props) $$invalidate(1, href = $$new_props.href);
    		if ("nativeType" in $$new_props) $$invalidate(2, nativeType = $$new_props.nativeType);
    		if ("loading" in $$new_props) $$invalidate(3, loading = $$new_props.loading);
    		if ("inverted" in $$new_props) $$invalidate(4, inverted = $$new_props.inverted);
    		if ("outlined" in $$new_props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ("rounded" in $$new_props) $$invalidate(6, rounded = $$new_props.rounded);
    		if ("iconLeft" in $$new_props) $$invalidate(7, iconLeft = $$new_props.iconLeft);
    		if ("iconRight" in $$new_props) $$invalidate(8, iconRight = $$new_props.iconRight);
    		if ("iconPack" in $$new_props) $$invalidate(9, iconPack = $$new_props.iconPack);
    		if ("$$scope" in $$new_props) $$invalidate(14, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Icon,
    		omit,
    		tag,
    		type,
    		size,
    		href,
    		nativeType,
    		loading,
    		inverted,
    		outlined,
    		rounded,
    		iconLeft,
    		iconRight,
    		iconPack,
    		iconSize,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(18, $$props = assign(assign({}, $$props), $$new_props));
    		if ("tag" in $$props) $$invalidate(0, tag = $$new_props.tag);
    		if ("type" in $$props) $$invalidate(12, type = $$new_props.type);
    		if ("size" in $$props) $$invalidate(13, size = $$new_props.size);
    		if ("href" in $$props) $$invalidate(1, href = $$new_props.href);
    		if ("nativeType" in $$props) $$invalidate(2, nativeType = $$new_props.nativeType);
    		if ("loading" in $$props) $$invalidate(3, loading = $$new_props.loading);
    		if ("inverted" in $$props) $$invalidate(4, inverted = $$new_props.inverted);
    		if ("outlined" in $$props) $$invalidate(5, outlined = $$new_props.outlined);
    		if ("rounded" in $$props) $$invalidate(6, rounded = $$new_props.rounded);
    		if ("iconLeft" in $$props) $$invalidate(7, iconLeft = $$new_props.iconLeft);
    		if ("iconRight" in $$props) $$invalidate(8, iconRight = $$new_props.iconRight);
    		if ("iconPack" in $$props) $$invalidate(9, iconPack = $$new_props.iconPack);
    		if ("iconSize" in $$props) $$invalidate(10, iconSize = $$new_props.iconSize);
    		if ("props" in $$props) $$invalidate(11, props = $$new_props.props);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(11, props = {
    			...omit($$props, "loading", "inverted", "nativeType", "outlined", "rounded", "type"),
    			class: `button ${type} ${size} ${$$props.class || ""}`
    		});

    		if ($$self.$$.dirty & /*size*/ 8192) {
    			 {
    				if (!size || size === "is-medium") {
    					$$invalidate(10, iconSize = "is-small");
    				} else if (size === "is-large") {
    					$$invalidate(10, iconSize = "is-medium");
    				} else {
    					$$invalidate(10, iconSize = size);
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		tag,
    		href,
    		nativeType,
    		loading,
    		inverted,
    		outlined,
    		rounded,
    		iconLeft,
    		iconRight,
    		iconPack,
    		iconSize,
    		props,
    		type,
    		size,
    		$$scope,
    		slots,
    		click_handler,
    		click_handler_1
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			tag: 0,
    			type: 12,
    			size: 13,
    			href: 1,
    			nativeType: 2,
    			loading: 3,
    			inverted: 4,
    			outlined: 5,
    			rounded: 6,
    			iconLeft: 7,
    			iconRight: 8,
    			iconPack: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get tag() {
    		throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tag(value) {
    		throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nativeType() {
    		throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nativeType(value) {
    		throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverted() {
    		throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverted(value) {
    		throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconLeft() {
    		throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconLeft(value) {
    		throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconRight() {
    		throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconRight(value) {
    		throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconPack() {
    		throw new Error_1("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconPack(value) {
    		throw new Error_1("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelma/src/components/Field.svelte generated by Svelte v3.31.2 */
    const file$2 = "node_modules/svelma/src/components/Field.svelte";
    const get_default_slot_changes = dirty => ({ statusType: dirty & /*type*/ 1 });
    const get_default_slot_context = ctx => ({ statusType: /*type*/ ctx[0] });

    // (105:2) {#if label}
    function create_if_block_1$1(ctx) {
    	let label_1;
    	let t;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			t = text(/*label*/ ctx[1]);
    			attr_dev(label_1, "for", /*labelFor*/ ctx[2]);
    			attr_dev(label_1, "class", "label");
    			add_location(label_1, file$2, 105, 4, 2654);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, t);
    			/*label_1_binding*/ ctx[19](label_1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 2) set_data_dev(t, /*label*/ ctx[1]);

    			if (dirty & /*labelFor*/ 4) {
    				attr_dev(label_1, "for", /*labelFor*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			/*label_1_binding*/ ctx[19](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(105:2) {#if label}",
    		ctx
    	});

    	return block;
    }

    // (109:2) {#if message}
    function create_if_block$1(ctx) {
    	let p;
    	let t;
    	let p_class_value;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*message*/ ctx[3]);
    			attr_dev(p, "class", p_class_value = "help " + /*type*/ ctx[0] + " svelte-1m7or");
    			add_location(p, file$2, 109, 4, 2783);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    			/*p_binding*/ ctx[20](p);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 8) set_data_dev(t, /*message*/ ctx[3]);

    			if (dirty & /*type*/ 1 && p_class_value !== (p_class_value = "help " + /*type*/ ctx[0] + " svelte-1m7or")) {
    				attr_dev(p, "class", p_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			/*p_binding*/ ctx[20](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(109:2) {#if message}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let div_class_value;
    	let current;
    	let if_block0 = /*label*/ ctx[1] && create_if_block_1$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[18].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[17], get_default_slot_context);
    	let if_block1 = /*message*/ ctx[3] && create_if_block$1(ctx);

    	let div_levels = [
    		/*props*/ ctx[11],
    		{
    			class: div_class_value = "field " + /*type*/ ctx[0] + " " + /*fieldType*/ ctx[9] + " " + /*newPosition*/ ctx[10] + " " + (/*$$props*/ ctx[12].class || "")
    		}
    	];

    	let div_data = {};

    	for (let i = 0; i < div_levels.length; i += 1) {
    		div_data = assign(div_data, div_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			set_attributes(div, div_data);
    			toggle_class(div, "is-expanded", /*expanded*/ ctx[5]);
    			toggle_class(div, "is-grouped-multiline", /*groupMultiline*/ ctx[4]);
    			toggle_class(div, "svelte-1m7or", true);
    			add_location(div, file$2, 103, 0, 2462);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t1);
    			if (if_block1) if_block1.m(div, null);
    			/*div_binding*/ ctx[21](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*label*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, type*/ 131073) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[17], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}

    			if (/*message*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			set_attributes(div, div_data = get_spread_update(div_levels, [
    				dirty & /*props*/ 2048 && /*props*/ ctx[11],
    				(!current || dirty & /*type, fieldType, newPosition, $$props*/ 5633 && div_class_value !== (div_class_value = "field " + /*type*/ ctx[0] + " " + /*fieldType*/ ctx[9] + " " + /*newPosition*/ ctx[10] + " " + (/*$$props*/ ctx[12].class || ""))) && { class: div_class_value }
    			]));

    			toggle_class(div, "is-expanded", /*expanded*/ ctx[5]);
    			toggle_class(div, "is-grouped-multiline", /*groupMultiline*/ ctx[4]);
    			toggle_class(div, "svelte-1m7or", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			/*div_binding*/ ctx[21](null);
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

    function instance$2($$self, $$props, $$invalidate) {
    	let props;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Field", slots, ['default']);
    	let { type = "" } = $$props;
    	let { label = null } = $$props;
    	let { labelFor = "" } = $$props;
    	let { message = "" } = $$props;
    	let { grouped = false } = $$props;
    	let { groupMultiline = false } = $$props;
    	let { position = "" } = $$props;
    	let { addons = true } = $$props;
    	let { expanded = false } = $$props;
    	setContext("type", () => type);
    	let el;
    	let labelEl;
    	let messageEl;
    	let fieldType = "";
    	let hasIcons = false;
    	let iconType = "";
    	let mounted = false;
    	let newPosition = "";

    	onMount(() => {
    		$$invalidate(16, mounted = true);
    	});

    	function label_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			labelEl = $$value;
    			$$invalidate(7, labelEl);
    		});
    	}

    	function p_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			messageEl = $$value;
    			$$invalidate(8, messageEl);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(6, el);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("type" in $$new_props) $$invalidate(0, type = $$new_props.type);
    		if ("label" in $$new_props) $$invalidate(1, label = $$new_props.label);
    		if ("labelFor" in $$new_props) $$invalidate(2, labelFor = $$new_props.labelFor);
    		if ("message" in $$new_props) $$invalidate(3, message = $$new_props.message);
    		if ("grouped" in $$new_props) $$invalidate(13, grouped = $$new_props.grouped);
    		if ("groupMultiline" in $$new_props) $$invalidate(4, groupMultiline = $$new_props.groupMultiline);
    		if ("position" in $$new_props) $$invalidate(14, position = $$new_props.position);
    		if ("addons" in $$new_props) $$invalidate(15, addons = $$new_props.addons);
    		if ("expanded" in $$new_props) $$invalidate(5, expanded = $$new_props.expanded);
    		if ("$$scope" in $$new_props) $$invalidate(17, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		setContext,
    		omit,
    		type,
    		label,
    		labelFor,
    		message,
    		grouped,
    		groupMultiline,
    		position,
    		addons,
    		expanded,
    		el,
    		labelEl,
    		messageEl,
    		fieldType,
    		hasIcons,
    		iconType,
    		mounted,
    		newPosition,
    		props
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(12, $$props = assign(assign({}, $$props), $$new_props));
    		if ("type" in $$props) $$invalidate(0, type = $$new_props.type);
    		if ("label" in $$props) $$invalidate(1, label = $$new_props.label);
    		if ("labelFor" in $$props) $$invalidate(2, labelFor = $$new_props.labelFor);
    		if ("message" in $$props) $$invalidate(3, message = $$new_props.message);
    		if ("grouped" in $$props) $$invalidate(13, grouped = $$new_props.grouped);
    		if ("groupMultiline" in $$props) $$invalidate(4, groupMultiline = $$new_props.groupMultiline);
    		if ("position" in $$props) $$invalidate(14, position = $$new_props.position);
    		if ("addons" in $$props) $$invalidate(15, addons = $$new_props.addons);
    		if ("expanded" in $$props) $$invalidate(5, expanded = $$new_props.expanded);
    		if ("el" in $$props) $$invalidate(6, el = $$new_props.el);
    		if ("labelEl" in $$props) $$invalidate(7, labelEl = $$new_props.labelEl);
    		if ("messageEl" in $$props) $$invalidate(8, messageEl = $$new_props.messageEl);
    		if ("fieldType" in $$props) $$invalidate(9, fieldType = $$new_props.fieldType);
    		if ("hasIcons" in $$props) hasIcons = $$new_props.hasIcons;
    		if ("iconType" in $$props) iconType = $$new_props.iconType;
    		if ("mounted" in $$props) $$invalidate(16, mounted = $$new_props.mounted);
    		if ("newPosition" in $$props) $$invalidate(10, newPosition = $$new_props.newPosition);
    		if ("props" in $$props) $$invalidate(11, props = $$new_props.props);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type*/ 1) {
    			// Determine the icon type
    			 {
    				if (["is-danger", "is-success"].includes(type)) {
    					iconType = type;
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*grouped, mounted, el, labelEl, messageEl, addons*/ 106944) {
    			 {
    				if (grouped) $$invalidate(9, fieldType = "is-grouped"); else if (mounted) {
    					const childNodes = Array.prototype.filter.call(el.children, c => ![labelEl, messageEl].includes(c));

    					if (childNodes.length > 1 && addons) {
    						$$invalidate(9, fieldType = "has-addons");
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*position, grouped*/ 24576) {
    			// Update has-addons-* or is-grouped-* classes based on position prop
    			 {
    				if (position) {
    					const pos = position.split("-");

    					if (pos.length >= 1) {
    						const prefix = grouped ? "is-grouped-" : "has-addons-";
    						$$invalidate(10, newPosition = prefix + pos[1]);
    					}
    				}
    			}
    		}

    		 $$invalidate(11, props = {
    			...omit($$props, "addons", "class", "expanded", "grouped", "label", "labelFor", "position", "type")
    		});
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		type,
    		label,
    		labelFor,
    		message,
    		groupMultiline,
    		expanded,
    		el,
    		labelEl,
    		messageEl,
    		fieldType,
    		newPosition,
    		props,
    		$$props,
    		grouped,
    		position,
    		addons,
    		mounted,
    		$$scope,
    		slots,
    		label_1_binding,
    		p_binding,
    		div_binding
    	];
    }

    class Field extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			type: 0,
    			label: 1,
    			labelFor: 2,
    			message: 3,
    			grouped: 13,
    			groupMultiline: 4,
    			position: 14,
    			addons: 15,
    			expanded: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Field",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get type() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelFor() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelFor(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get message() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get grouped() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set grouped(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get groupMultiline() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set groupMultiline(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addons() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addons(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expanded() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelma/src/components/Input.svelte generated by Svelte v3.31.2 */
    const file$3 = "node_modules/svelma/src/components/Input.svelte";

    // (156:2) {:else}
    function create_else_block(ctx) {
    	let textarea;
    	let textarea_class_value;
    	let mounted;
    	let dispose;

    	let textarea_levels = [
    		/*props*/ ctx[17],
    		{ value: /*value*/ ctx[0] },
    		{
    			class: textarea_class_value = "textarea " + /*statusType*/ ctx[11] + "\n      " + /*size*/ ctx[2]
    		},
    		{ disabled: /*disabled*/ ctx[10] }
    	];

    	let textarea_data = {};

    	for (let i = 0; i < textarea_levels.length; i += 1) {
    		textarea_data = assign(textarea_data, textarea_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			set_attributes(textarea, textarea_data);
    			toggle_class(textarea, "svelte-1v5s752", true);
    			add_location(textarea, file$3, 156, 4, 3907);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    			/*textarea_binding*/ ctx[31](textarea);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*events*/ ctx[25].call(null, textarea)),
    					listen_dev(textarea, "input", /*onInput*/ ctx[22], false, false, false),
    					listen_dev(textarea, "focus", /*onFocus*/ ctx[23], false, false, false),
    					listen_dev(textarea, "blur", /*onBlur*/ ctx[24], false, false, false),
    					listen_dev(textarea, "change", /*change_handler_1*/ ctx[29], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(textarea, textarea_data = get_spread_update(textarea_levels, [
    				dirty[0] & /*props*/ 131072 && /*props*/ ctx[17],
    				dirty[0] & /*value*/ 1 && { value: /*value*/ ctx[0] },
    				dirty[0] & /*statusType, size*/ 2052 && textarea_class_value !== (textarea_class_value = "textarea " + /*statusType*/ ctx[11] + "\n      " + /*size*/ ctx[2]) && { class: textarea_class_value },
    				dirty[0] & /*disabled*/ 1024 && { disabled: /*disabled*/ ctx[10] }
    			]));

    			toggle_class(textarea, "svelte-1v5s752", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    			/*textarea_binding*/ ctx[31](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(156:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (143:2) {#if type !== 'textarea'}
    function create_if_block_3$1(ctx) {
    	let input_1;
    	let input_1_class_value;
    	let mounted;
    	let dispose;

    	let input_1_levels = [
    		/*props*/ ctx[17],
    		{ type: /*newType*/ ctx[14] },
    		{ value: /*value*/ ctx[0] },
    		{
    			class: input_1_class_value = "input " + /*statusType*/ ctx[11] + " " + /*size*/ ctx[2] + " " + (/*$$props*/ ctx[26].class || "")
    		},
    		{ disabled: /*disabled*/ ctx[10] }
    	];

    	let input_1_data = {};

    	for (let i = 0; i < input_1_levels.length; i += 1) {
    		input_1_data = assign(input_1_data, input_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			input_1 = element("input");
    			set_attributes(input_1, input_1_data);
    			toggle_class(input_1, "svelte-1v5s752", true);
    			add_location(input_1, file$3, 143, 4, 3622);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input_1, anchor);
    			input_1.value = input_1_data.value;
    			/*input_1_binding*/ ctx[30](input_1);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*events*/ ctx[25].call(null, input_1)),
    					listen_dev(input_1, "input", /*onInput*/ ctx[22], false, false, false),
    					listen_dev(input_1, "focus", /*onFocus*/ ctx[23], false, false, false),
    					listen_dev(input_1, "blur", /*onBlur*/ ctx[24], false, false, false),
    					listen_dev(input_1, "change", /*change_handler*/ ctx[28], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
    				dirty[0] & /*props*/ 131072 && /*props*/ ctx[17],
    				dirty[0] & /*newType*/ 16384 && { type: /*newType*/ ctx[14] },
    				dirty[0] & /*value*/ 1 && input_1.value !== /*value*/ ctx[0] && { value: /*value*/ ctx[0] },
    				dirty[0] & /*statusType, size, $$props*/ 67110916 && input_1_class_value !== (input_1_class_value = "input " + /*statusType*/ ctx[11] + " " + /*size*/ ctx[2] + " " + (/*$$props*/ ctx[26].class || "")) && { class: input_1_class_value },
    				dirty[0] & /*disabled*/ 1024 && { disabled: /*disabled*/ ctx[10] }
    			]));

    			if ("value" in input_1_data) {
    				input_1.value = input_1_data.value;
    			}

    			toggle_class(input_1, "svelte-1v5s752", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input_1);
    			/*input_1_binding*/ ctx[30](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(143:2) {#if type !== 'textarea'}",
    		ctx
    	});

    	return block;
    }

    // (171:2) {#if icon}
    function create_if_block_2$1(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				pack: /*iconPack*/ ctx[9],
    				isLeft: true,
    				icon: /*icon*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty[0] & /*iconPack*/ 512) icon_1_changes.pack = /*iconPack*/ ctx[9];
    			if (dirty[0] & /*icon*/ 256) icon_1_changes.icon = /*icon*/ ctx[8];
    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(171:2) {#if icon}",
    		ctx
    	});

    	return block;
    }

    // (178:2) {#if !loading && (passwordReveal || statusType)}
    function create_if_block_1$2(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				pack: "fas",
    				isRight: true,
    				isClickable: /*passwordReveal*/ ctx[4],
    				icon: /*passwordReveal*/ ctx[4]
    				? /*passwordVisibleIcon*/ ctx[20]
    				: /*statusTypeIcon*/ ctx[15],
    				type: !/*passwordReveal*/ ctx[4]
    				? /*statusType*/ ctx[11]
    				: "is-primary"
    			},
    			$$inline: true
    		});

    	icon_1.$on("click", /*togglePasswordVisibility*/ ctx[21]);

    	const block = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty[0] & /*passwordReveal*/ 16) icon_1_changes.isClickable = /*passwordReveal*/ ctx[4];

    			if (dirty[0] & /*passwordReveal, passwordVisibleIcon, statusTypeIcon*/ 1081360) icon_1_changes.icon = /*passwordReveal*/ ctx[4]
    			? /*passwordVisibleIcon*/ ctx[20]
    			: /*statusTypeIcon*/ ctx[15];

    			if (dirty[0] & /*passwordReveal, statusType*/ 2064) icon_1_changes.type = !/*passwordReveal*/ ctx[4]
    			? /*statusType*/ ctx[11]
    			: "is-primary";

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(178:2) {#if !loading && (passwordReveal || statusType)}",
    		ctx
    	});

    	return block;
    }

    // (190:2) {#if maxlength && hasCounter && type !== 'number'}
    function create_if_block$2(ctx) {
    	let small;
    	let t0;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			small = element("small");
    			t0 = text(/*valueLength*/ ctx[16]);
    			t1 = text(" / ");
    			t2 = text(/*maxlength*/ ctx[5]);
    			attr_dev(small, "class", "help counter svelte-1v5s752");
    			toggle_class(small, "is-invisible", !/*isFocused*/ ctx[13]);
    			add_location(small, file$3, 190, 4, 4664);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, small, anchor);
    			append_dev(small, t0);
    			append_dev(small, t1);
    			append_dev(small, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*valueLength*/ 65536) set_data_dev(t0, /*valueLength*/ ctx[16]);
    			if (dirty[0] & /*maxlength*/ 32) set_data_dev(t2, /*maxlength*/ ctx[5]);

    			if (dirty[0] & /*isFocused*/ 8192) {
    				toggle_class(small, "is-invisible", !/*isFocused*/ ctx[13]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(small);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(190:2) {#if maxlength && hasCounter && type !== 'number'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[1] !== "textarea") return create_if_block_3$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*icon*/ ctx[8] && create_if_block_2$1(ctx);
    	let if_block2 = !/*loading*/ ctx[7] && (/*passwordReveal*/ ctx[4] || /*statusType*/ ctx[11]) && create_if_block_1$2(ctx);
    	let if_block3 = /*maxlength*/ ctx[5] && /*hasCounter*/ ctx[6] && /*type*/ ctx[1] !== "number" && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(div, "class", "control svelte-1v5s752");
    			toggle_class(div, "has-icons-left", /*hasIconLeft*/ ctx[18]);
    			toggle_class(div, "has-icons-right", /*hasIconRight*/ ctx[19]);
    			toggle_class(div, "is-loading", /*loading*/ ctx[7]);
    			toggle_class(div, "is-expanded", /*expanded*/ ctx[3]);
    			add_location(div, file$3, 140, 0, 3439);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    			append_dev(div, t2);
    			if (if_block3) if_block3.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			}

    			if (/*icon*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*icon*/ 256) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!/*loading*/ ctx[7] && (/*passwordReveal*/ ctx[4] || /*statusType*/ ctx[11])) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*loading, passwordReveal, statusType*/ 2192) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1$2(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*maxlength*/ ctx[5] && /*hasCounter*/ ctx[6] && /*type*/ ctx[1] !== "number") {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$2(ctx);
    					if_block3.c();
    					if_block3.m(div, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (dirty[0] & /*hasIconLeft*/ 262144) {
    				toggle_class(div, "has-icons-left", /*hasIconLeft*/ ctx[18]);
    			}

    			if (dirty[0] & /*hasIconRight*/ 524288) {
    				toggle_class(div, "has-icons-right", /*hasIconRight*/ ctx[19]);
    			}

    			if (dirty[0] & /*loading*/ 128) {
    				toggle_class(div, "is-loading", /*loading*/ ctx[7]);
    			}

    			if (dirty[0] & /*expanded*/ 8) {
    				toggle_class(div, "is-expanded", /*expanded*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
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

    function instance$3($$self, $$props, $$invalidate) {
    	let props;
    	let hasIconLeft;
    	let hasIconRight;
    	let passwordVisibleIcon;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Input", slots, []);
    	let { value = "" } = $$props;
    	let { type = "text" } = $$props;
    	let { size = "" } = $$props;
    	let { expanded = false } = $$props;
    	let { passwordReveal = false } = $$props;
    	let { maxlength = null } = $$props;
    	let { hasCounter = true } = $$props;
    	let { loading = false } = $$props;
    	let { icon = "" } = $$props;
    	let { iconPack = "" } = $$props;
    	let { disabled = false } = $$props;
    	let input;
    	let isFocused;
    	let isPasswordVisible = false;
    	let newType = "text";
    	let statusType = "";
    	let statusTypeIcon = "";
    	let valueLength = null;
    	const dispatch = createEventDispatcher();
    	const getType = getContext("type");
    	if (getType) statusType = getType() || "";

    	onMount(() => {
    		$$invalidate(14, newType = type);
    	});

    	async function togglePasswordVisibility() {
    		$$invalidate(27, isPasswordVisible = !isPasswordVisible);
    		$$invalidate(14, newType = isPasswordVisible ? "text" : "password");
    		await tick();
    		input.focus();
    	}

    	const onInput = e => {
    		$$invalidate(0, value = e.target.value);
    		$$invalidate(26, $$props.value = value, $$props);
    		dispatch("input", e);
    	};

    	const onFocus = () => $$invalidate(13, isFocused = true);
    	const onBlur = () => $$invalidate(13, isFocused = false);
    	const events = getEventsAction(current_component);

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function change_handler_1(event) {
    		bubble($$self, event);
    	}

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(12, input);
    		});
    	}

    	function textarea_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(12, input);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(26, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ("type" in $$new_props) $$invalidate(1, type = $$new_props.type);
    		if ("size" in $$new_props) $$invalidate(2, size = $$new_props.size);
    		if ("expanded" in $$new_props) $$invalidate(3, expanded = $$new_props.expanded);
    		if ("passwordReveal" in $$new_props) $$invalidate(4, passwordReveal = $$new_props.passwordReveal);
    		if ("maxlength" in $$new_props) $$invalidate(5, maxlength = $$new_props.maxlength);
    		if ("hasCounter" in $$new_props) $$invalidate(6, hasCounter = $$new_props.hasCounter);
    		if ("loading" in $$new_props) $$invalidate(7, loading = $$new_props.loading);
    		if ("icon" in $$new_props) $$invalidate(8, icon = $$new_props.icon);
    		if ("iconPack" in $$new_props) $$invalidate(9, iconPack = $$new_props.iconPack);
    		if ("disabled" in $$new_props) $$invalidate(10, disabled = $$new_props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		getContext,
    		tick,
    		omit,
    		getEventsAction,
    		current_component,
    		Icon,
    		value,
    		type,
    		size,
    		expanded,
    		passwordReveal,
    		maxlength,
    		hasCounter,
    		loading,
    		icon,
    		iconPack,
    		disabled,
    		input,
    		isFocused,
    		isPasswordVisible,
    		newType,
    		statusType,
    		statusTypeIcon,
    		valueLength,
    		dispatch,
    		getType,
    		togglePasswordVisibility,
    		onInput,
    		onFocus,
    		onBlur,
    		events,
    		props,
    		hasIconLeft,
    		hasIconRight,
    		passwordVisibleIcon
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(26, $$props = assign(assign({}, $$props), $$new_props));
    		if ("value" in $$props) $$invalidate(0, value = $$new_props.value);
    		if ("type" in $$props) $$invalidate(1, type = $$new_props.type);
    		if ("size" in $$props) $$invalidate(2, size = $$new_props.size);
    		if ("expanded" in $$props) $$invalidate(3, expanded = $$new_props.expanded);
    		if ("passwordReveal" in $$props) $$invalidate(4, passwordReveal = $$new_props.passwordReveal);
    		if ("maxlength" in $$props) $$invalidate(5, maxlength = $$new_props.maxlength);
    		if ("hasCounter" in $$props) $$invalidate(6, hasCounter = $$new_props.hasCounter);
    		if ("loading" in $$props) $$invalidate(7, loading = $$new_props.loading);
    		if ("icon" in $$props) $$invalidate(8, icon = $$new_props.icon);
    		if ("iconPack" in $$props) $$invalidate(9, iconPack = $$new_props.iconPack);
    		if ("disabled" in $$props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ("input" in $$props) $$invalidate(12, input = $$new_props.input);
    		if ("isFocused" in $$props) $$invalidate(13, isFocused = $$new_props.isFocused);
    		if ("isPasswordVisible" in $$props) $$invalidate(27, isPasswordVisible = $$new_props.isPasswordVisible);
    		if ("newType" in $$props) $$invalidate(14, newType = $$new_props.newType);
    		if ("statusType" in $$props) $$invalidate(11, statusType = $$new_props.statusType);
    		if ("statusTypeIcon" in $$props) $$invalidate(15, statusTypeIcon = $$new_props.statusTypeIcon);
    		if ("valueLength" in $$props) $$invalidate(16, valueLength = $$new_props.valueLength);
    		if ("props" in $$props) $$invalidate(17, props = $$new_props.props);
    		if ("hasIconLeft" in $$props) $$invalidate(18, hasIconLeft = $$new_props.hasIconLeft);
    		if ("hasIconRight" in $$props) $$invalidate(19, hasIconRight = $$new_props.hasIconRight);
    		if ("passwordVisibleIcon" in $$props) $$invalidate(20, passwordVisibleIcon = $$new_props.passwordVisibleIcon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(17, props = {
    			...omit($$props, "class", "value", "type", "size", "passwordReveal", "hasCounter", "loading", "disabled")
    		});

    		if ($$self.$$.dirty[0] & /*icon*/ 256) {
    			 $$invalidate(18, hasIconLeft = !!icon);
    		}

    		if ($$self.$$.dirty[0] & /*passwordReveal, loading, statusType*/ 2192) {
    			 $$invalidate(19, hasIconRight = passwordReveal || loading || statusType);
    		}

    		if ($$self.$$.dirty[0] & /*isPasswordVisible*/ 134217728) {
    			 $$invalidate(20, passwordVisibleIcon = isPasswordVisible ? "eye-slash" : "eye");
    		}

    		if ($$self.$$.dirty[0] & /*statusType*/ 2048) {
    			 {
    				switch (statusType) {
    					case "is-success":
    						$$invalidate(15, statusTypeIcon = "check");
    						break;
    					case "is-danger":
    						$$invalidate(15, statusTypeIcon = "exclamation-circle");
    						break;
    					case "is-info":
    						$$invalidate(15, statusTypeIcon = "info-circle");
    						break;
    					case "is-warning":
    						$$invalidate(15, statusTypeIcon = "exclamation-triangle");
    						break;
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*value*/ 1) {
    			 {
    				if (typeof value === "string") {
    					$$invalidate(16, valueLength = value.length);
    				} else if (typeof value === "number") {
    					$$invalidate(16, valueLength = value.toString().length);
    				} else {
    					$$invalidate(16, valueLength = 0);
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		type,
    		size,
    		expanded,
    		passwordReveal,
    		maxlength,
    		hasCounter,
    		loading,
    		icon,
    		iconPack,
    		disabled,
    		statusType,
    		input,
    		isFocused,
    		newType,
    		statusTypeIcon,
    		valueLength,
    		props,
    		hasIconLeft,
    		hasIconRight,
    		passwordVisibleIcon,
    		togglePasswordVisibility,
    		onInput,
    		onFocus,
    		onBlur,
    		events,
    		$$props,
    		isPasswordVisible,
    		change_handler,
    		change_handler_1,
    		input_1_binding,
    		textarea_binding
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				value: 0,
    				type: 1,
    				size: 2,
    				expanded: 3,
    				passwordReveal: 4,
    				maxlength: 5,
    				hasCounter: 6,
    				loading: 7,
    				icon: 8,
    				iconPack: 9,
    				disabled: 10
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expanded() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get passwordReveal() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set passwordReveal(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxlength() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxlength(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasCounter() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasCounter(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconPack() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconPack(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelma/src/components/Message.svelte generated by Svelte v3.31.2 */
    const file$4 = "node_modules/svelma/src/components/Message.svelte";

    // (64:0) {#if active}
    function create_if_block$3(ctx) {
    	let article;
    	let t0;
    	let section;
    	let div1;
    	let t1;
    	let div0;
    	let article_class_value;
    	let article_transition;
    	let current;
    	let if_block0 = (/*title*/ ctx[2] || /*showClose*/ ctx[3]) && create_if_block_2$2(ctx);
    	let if_block1 = /*icon*/ ctx[5] && create_if_block_1$3(ctx);
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			article = element("article");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			section = element("section");
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "media-content");
    			add_location(div0, file$4, 82, 8, 1705);
    			attr_dev(div1, "class", "media svelte-2cbde2");
    			add_location(div1, file$4, 76, 6, 1545);
    			attr_dev(section, "class", "message-body");
    			add_location(section, file$4, 75, 4, 1508);
    			attr_dev(article, "class", article_class_value = "message " + /*type*/ ctx[1] + " " + /*size*/ ctx[4] + " svelte-2cbde2");
    			add_location(article, file$4, 64, 2, 1177);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			if (if_block0) if_block0.m(article, null);
    			append_dev(article, t0);
    			append_dev(article, section);
    			append_dev(section, div1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2] || /*showClose*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					if_block0.m(article, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*icon*/ ctx[5]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*icon*/ 32) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type, size*/ 18 && article_class_value !== (article_class_value = "message " + /*type*/ ctx[1] + " " + /*size*/ ctx[4] + " svelte-2cbde2")) {
    				attr_dev(article, "class", article_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(default_slot, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!article_transition) article_transition = create_bidirectional_transition(article, fade, {}, true);
    					article_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(default_slot, local);

    			if (local) {
    				if (!article_transition) article_transition = create_bidirectional_transition(article, fade, {}, false);
    				article_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && article_transition) article_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(64:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    // (66:4) {#if title || showClose}
    function create_if_block_2$2(ctx) {
    	let div;
    	let t;
    	let if_block0 = /*title*/ ctx[2] && create_if_block_4$1(ctx);
    	let if_block1 = /*showClose*/ ctx[3] && create_if_block_3$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div, "class", "message-header svelte-2cbde2");
    			add_location(div, file$4, 66, 6, 1274);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*showClose*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$2(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(66:4) {#if title || showClose}",
    		ctx
    	});

    	return block;
    }

    // (68:8) {#if title}
    function create_if_block_4$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*title*/ ctx[2]);
    			add_location(p, file$4, 68, 10, 1333);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 4) set_data_dev(t, /*title*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(68:8) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (71:8) {#if showClose}
    function create_if_block_3$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "delete");
    			attr_dev(button, "aria-label", "ariaCloseLabel");
    			add_location(button, file$4, 71, 10, 1396);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*close*/ ctx[6])) /*close*/ ctx[6].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(71:8) {#if showClose}",
    		ctx
    	});

    	return block;
    }

    // (78:8) {#if icon}
    function create_if_block_1$3(ctx) {
    	let div;
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				icon: /*icon*/ ctx[5],
    				size: /*newIconSize*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icon_1.$$.fragment);
    			attr_dev(div, "class", "media-left");
    			add_location(div, file$4, 78, 10, 1594);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icon_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*icon*/ 32) icon_1_changes.icon = /*icon*/ ctx[5];
    			if (dirty & /*newIconSize*/ 128) icon_1_changes.size = /*newIconSize*/ ctx[7];
    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(78:8) {#if icon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let newIconSize;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Message", slots, ['default']);
    	let { type = "" } = $$props;
    	let { active = true } = $$props;
    	let { title = "" } = $$props;
    	let { showClose = true } = $$props;
    	let { autoClose = false } = $$props;
    	let { duration = 5000 } = $$props;
    	let { size = "" } = $$props;
    	let { iconSize = "" } = $$props;
    	let { ariaCloseLabel = "delete" } = $$props;
    	let icon;
    	const dispatch = createEventDispatcher();

    	if (autoClose) {
    		setTimeout(
    			() => {
    				$$invalidate(6, close = true);
    			},
    			duration
    		);
    	}

    	function close() {
    		$$invalidate(0, active = false);
    		dispatch("close", active);
    	}

    	const writable_props = [
    		"type",
    		"active",
    		"title",
    		"showClose",
    		"autoClose",
    		"duration",
    		"size",
    		"iconSize",
    		"ariaCloseLabel"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Message> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("showClose" in $$props) $$invalidate(3, showClose = $$props.showClose);
    		if ("autoClose" in $$props) $$invalidate(8, autoClose = $$props.autoClose);
    		if ("duration" in $$props) $$invalidate(9, duration = $$props.duration);
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("iconSize" in $$props) $$invalidate(10, iconSize = $$props.iconSize);
    		if ("ariaCloseLabel" in $$props) $$invalidate(11, ariaCloseLabel = $$props.ariaCloseLabel);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		fade,
    		Icon,
    		type,
    		active,
    		title,
    		showClose,
    		autoClose,
    		duration,
    		size,
    		iconSize,
    		ariaCloseLabel,
    		icon,
    		dispatch,
    		close,
    		newIconSize
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("title" in $$props) $$invalidate(2, title = $$props.title);
    		if ("showClose" in $$props) $$invalidate(3, showClose = $$props.showClose);
    		if ("autoClose" in $$props) $$invalidate(8, autoClose = $$props.autoClose);
    		if ("duration" in $$props) $$invalidate(9, duration = $$props.duration);
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("iconSize" in $$props) $$invalidate(10, iconSize = $$props.iconSize);
    		if ("ariaCloseLabel" in $$props) $$invalidate(11, ariaCloseLabel = $$props.ariaCloseLabel);
    		if ("icon" in $$props) $$invalidate(5, icon = $$props.icon);
    		if ("newIconSize" in $$props) $$invalidate(7, newIconSize = $$props.newIconSize);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*iconSize, size*/ 1040) {
    			 $$invalidate(7, newIconSize = iconSize || size || "is-large");
    		}

    		if ($$self.$$.dirty & /*type*/ 2) {
    			 {
    				switch (type) {
    					case "is-info":
    						$$invalidate(5, icon = "info-circle");
    						break;
    					case "is-success":
    						$$invalidate(5, icon = "check-circle");
    						break;
    					case "is-warning":
    						$$invalidate(5, icon = "exclamation-triangle");
    						break;
    					case "is-danger":
    						$$invalidate(5, icon = "exclamation-circle");
    						break;
    					default:
    						$$invalidate(5, icon = null);
    				}
    			}
    		}
    	};

    	return [
    		active,
    		type,
    		title,
    		showClose,
    		size,
    		icon,
    		close,
    		newIconSize,
    		autoClose,
    		duration,
    		iconSize,
    		ariaCloseLabel,
    		$$scope,
    		slots
    	];
    }

    class Message extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			type: 1,
    			active: 0,
    			title: 2,
    			showClose: 3,
    			autoClose: 8,
    			duration: 9,
    			size: 4,
    			iconSize: 10,
    			ariaCloseLabel: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Message",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get type() {
    		throw new Error("<Message>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Message>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Message>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Message>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Message>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Message>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showClose() {
    		throw new Error("<Message>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showClose(value) {
    		throw new Error("<Message>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoClose() {
    		throw new Error("<Message>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoClose(value) {
    		throw new Error("<Message>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Message>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Message>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Message>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Message>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconSize() {
    		throw new Error("<Message>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconSize(value) {
    		throw new Error("<Message>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ariaCloseLabel() {
    		throw new Error("<Message>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaCloseLabel(value) {
    		throw new Error("<Message>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelma/src/components/Modal/Modal.svelte generated by Svelte v3.31.2 */
    const file$5 = "node_modules/svelma/src/components/Modal/Modal.svelte";

    // (40:0) {#if active}
    function create_if_block$4(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let t1;
    	let div1;
    	let div2_transition;
    	let t2;
    	let div3_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);
    	let if_block = /*showClose*/ ctx[3] && create_if_block_1$4(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "modal-background");
    			add_location(div0, file$5, 41, 4, 816);
    			attr_dev(div1, "class", "sub-component");
    			add_location(div1, file$5, 44, 6, 1000);
    			attr_dev(div2, "class", "modal-content");
    			add_location(div2, file$5, 42, 4, 874);
    			attr_dev(div3, "class", div3_class_value = "modal " + /*size*/ ctx[2] + " is-active");
    			add_location(div3, file$5, 40, 2, 757);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div3, t2);
    			if (if_block) if_block.m(div3, null);
    			/*div3_binding*/ ctx[13](div3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*close*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2048) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[11], dirty, null, null);
    				}
    			}

    			if (/*showClose*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$4(ctx);
    					if_block.c();
    					if_block.m(div3, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*size*/ 4 && div3_class_value !== (div3_class_value = "modal " + /*size*/ ctx[2] + " is-active")) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!div2_transition) div2_transition = create_bidirectional_transition(div2, /*_animation*/ ctx[5], /*animProps*/ ctx[1], true);
    					div2_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);

    			if (local) {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, /*_animation*/ ctx[5], /*animProps*/ ctx[1], false);
    				div2_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div2_transition) div2_transition.end();
    			if (if_block) if_block.d();
    			/*div3_binding*/ ctx[13](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(40:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    // (47:4) {#if showClose}
    function create_if_block_1$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "modal-close is-large");
    			attr_dev(button, "aria-label", "close");
    			add_location(button, file$5, 47, 6, 1071);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(47:4) {#if showClose}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*active*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*keydown*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
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

    function instance$5($$self, $$props, $$invalidate) {
    	let _animation;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	let { active = true } = $$props;
    	let { animation = "scale" } = $$props;
    	let { animProps = { start: 1.2 } } = $$props;
    	let { size = "" } = $$props;
    	let { showClose = true } = $$props;
    	let { subComponent = null } = $$props;
    	let { onBody = true } = $$props;
    	let modal;

    	onMount(() => {
    		
    	});

    	function close() {
    		$$invalidate(0, active = false);
    	}

    	function keydown(e) {
    		if (active && isEscKey(e)) {
    			close();
    		}
    	}

    	const writable_props = [
    		"active",
    		"animation",
    		"animProps",
    		"size",
    		"showClose",
    		"subComponent",
    		"onBody"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modal = $$value;
    			$$invalidate(4, modal);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("animation" in $$props) $$invalidate(8, animation = $$props.animation);
    		if ("animProps" in $$props) $$invalidate(1, animProps = $$props.animProps);
    		if ("size" in $$props) $$invalidate(2, size = $$props.size);
    		if ("showClose" in $$props) $$invalidate(3, showClose = $$props.showClose);
    		if ("subComponent" in $$props) $$invalidate(9, subComponent = $$props.subComponent);
    		if ("onBody" in $$props) $$invalidate(10, onBody = $$props.onBody);
    		if ("$$scope" in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		chooseAnimation,
    		isEscKey,
    		active,
    		animation,
    		animProps,
    		size,
    		showClose,
    		subComponent,
    		onBody,
    		modal,
    		close,
    		keydown,
    		_animation
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("animation" in $$props) $$invalidate(8, animation = $$props.animation);
    		if ("animProps" in $$props) $$invalidate(1, animProps = $$props.animProps);
    		if ("size" in $$props) $$invalidate(2, size = $$props.size);
    		if ("showClose" in $$props) $$invalidate(3, showClose = $$props.showClose);
    		if ("subComponent" in $$props) $$invalidate(9, subComponent = $$props.subComponent);
    		if ("onBody" in $$props) $$invalidate(10, onBody = $$props.onBody);
    		if ("modal" in $$props) $$invalidate(4, modal = $$props.modal);
    		if ("_animation" in $$props) $$invalidate(5, _animation = $$props._animation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*animation*/ 256) {
    			 $$invalidate(5, _animation = chooseAnimation(animation));
    		}

    		if ($$self.$$.dirty & /*modal, active, onBody*/ 1041) {
    			 {
    				if (modal && active && onBody) {
    					modal.parentNode.removeChild(modal);
    					document.body.appendChild(modal);
    				}
    			}
    		}
    	};

    	return [
    		active,
    		animProps,
    		size,
    		showClose,
    		modal,
    		_animation,
    		close,
    		keydown,
    		animation,
    		subComponent,
    		onBody,
    		$$scope,
    		slots,
    		div3_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			active: 0,
    			animation: 8,
    			animProps: 1,
    			size: 2,
    			showClose: 3,
    			subComponent: 9,
    			onBody: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get active() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animation() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animation(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showClose() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showClose(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subComponent() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subComponent(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onBody() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onBody(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    Modal.open = open;

    function open(props) {
      const modal = new Modal({
        target: document.body,
        props,
        intro: true
      });

      modal.close = () => modal.$destroy();

      return modal;
    }

    /* node_modules/svelma/src/components/Notices.svelte generated by Svelte v3.31.2 */

    const file$6 = "node_modules/svelma/src/components/Notices.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "notices " + /*positionClass*/ ctx[1] + " svelte-gicv46");
    			add_location(div, file$6, 39, 0, 884);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[4](div);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*positionClass*/ 2 && div_class_value !== (div_class_value = "notices " + /*positionClass*/ ctx[1] + " svelte-gicv46")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const notices = {};

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Notices", slots, []);
    	let { position = "top" } = $$props;
    	let container;
    	let positionClass;

    	function insert(el) {
    		container.insertAdjacentElement("afterbegin", el);
    	}

    	const writable_props = ["position"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Notices> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(0, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("position" in $$props) $$invalidate(2, position = $$props.position);
    	};

    	$$self.$capture_state = () => ({
    		notices,
    		position,
    		container,
    		positionClass,
    		insert
    	});

    	$$self.$inject_state = $$props => {
    		if ("position" in $$props) $$invalidate(2, position = $$props.position);
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("positionClass" in $$props) $$invalidate(1, positionClass = $$props.positionClass);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*position*/ 4) {
    			 $$invalidate(1, positionClass = position === "top" ? "is-top" : "is-bottom");
    		}
    	};

    	return [container, positionClass, position, insert, div_binding];
    }

    class Notices extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { position: 2, insert: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notices",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get position() {
    		throw new Error("<Notices>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<Notices>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get insert() {
    		return this.$$.ctx[3];
    	}

    	set insert(value) {
    		throw new Error("<Notices>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelma/src/components/Notice.svelte generated by Svelte v3.31.2 */

    const { Object: Object_1 } = globals;
    const file$7 = "node_modules/svelma/src/components/Notice.svelte";

    // (96:0) {#if active}
    function create_if_block$5(ctx) {
    	let div;
    	let div_class_value;
    	let div_aria_hidden_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "notice " + /*position*/ ctx[1] + " svelte-x3pnf9");
    			attr_dev(div, "aria-hidden", div_aria_hidden_value = !/*active*/ ctx[0]);
    			add_location(div, file$7, 96, 2, 1946);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[10](div);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "outroend", /*remove*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*position*/ 2 && div_class_value !== (div_class_value = "notice " + /*position*/ ctx[1] + " svelte-x3pnf9")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*active*/ 1 && div_aria_hidden_value !== (div_aria_hidden_value = !/*active*/ ctx[0])) {
    				attr_dev(div, "aria-hidden", div_aria_hidden_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, fly, { y: /*transitionY*/ ctx[4] });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div_intro) div_intro.invalidate();

    			div_outro = create_out_transition(div, fade, {
    				duration: /*transitionOut*/ ctx[2] ? 400 : 0
    			});

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[10](null);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(96:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[0] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const allowedProps = ["active", "position", "duration"];

    function filterProps(props) {
    	const newProps = {};

    	Object.keys(props).forEach(key => {
    		if (allowedProps.includes(key)) newProps[key] = props[key];
    	});

    	return newProps;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let transitionY;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Notice", slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { active = true } = $$props;
    	let { position = "is-top" } = $$props;
    	let { duration = 2000 } = $$props;
    	let { transitionOut = true } = $$props;
    	let el;
    	let parent;
    	let timer;

    	function close() {
    		$$invalidate(0, active = false);
    	}

    	function remove() {
    		clearTimeout(timer);

    		// Just making sure
    		$$invalidate(0, active = false);

    		dispatch("destroyed");
    	}

    	async function setupContainers() {
    		await tick;

    		if (!notices.top) {
    			notices.top = new Notices({
    					target: document.body,
    					props: { position: "top" }
    				});
    		}

    		if (!notices.bottom) {
    			notices.bottom = new Notices({
    					target: document.body,
    					props: { position: "bottom" }
    				});
    		}
    	}

    	function chooseParent() {
    		parent = notices.top;
    		if (position && position.indexOf("is-bottom") === 0) parent = notices.bottom;
    		parent.insert(el);
    	}

    	onMount(async () => {
    		await setupContainers();
    		chooseParent();

    		timer = setTimeout(
    			() => {
    				close();
    			},
    			duration
    		);
    	});

    	const writable_props = ["active", "position", "duration", "transitionOut"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Notice> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(3, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("position" in $$props) $$invalidate(1, position = $$props.position);
    		if ("duration" in $$props) $$invalidate(6, duration = $$props.duration);
    		if ("transitionOut" in $$props) $$invalidate(2, transitionOut = $$props.transitionOut);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		allowedProps,
    		filterProps,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		tick,
    		fly,
    		fade,
    		Notices,
    		notices,
    		dispatch,
    		active,
    		position,
    		duration,
    		transitionOut,
    		el,
    		parent,
    		timer,
    		close,
    		remove,
    		setupContainers,
    		chooseParent,
    		transitionY
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("position" in $$props) $$invalidate(1, position = $$props.position);
    		if ("duration" in $$props) $$invalidate(6, duration = $$props.duration);
    		if ("transitionOut" in $$props) $$invalidate(2, transitionOut = $$props.transitionOut);
    		if ("el" in $$props) $$invalidate(3, el = $$props.el);
    		if ("parent" in $$props) parent = $$props.parent;
    		if ("timer" in $$props) timer = $$props.timer;
    		if ("transitionY" in $$props) $$invalidate(4, transitionY = $$props.transitionY);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*position*/ 2) {
    			 $$invalidate(4, transitionY = ~position.indexOf("is-top") ? -200 : 200);
    		}
    	};

    	return [
    		active,
    		position,
    		transitionOut,
    		el,
    		transitionY,
    		remove,
    		duration,
    		close,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Notice extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			active: 0,
    			position: 1,
    			duration: 6,
    			transitionOut: 2,
    			close: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notice",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get active() {
    		throw new Error("<Notice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<Notice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Notice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionOut() {
    		throw new Error("<Notice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionOut(value) {
    		throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		return this.$$.ctx[7];
    	}

    	set close(value) {
    		throw new Error("<Notice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelma/src/components/Notification/Notification.svelte generated by Svelte v3.31.2 */
    const file$8 = "node_modules/svelma/src/components/Notification/Notification.svelte";

    // (92:0) {#if active}
    function create_if_block$6(ctx) {
    	let article;
    	let t0;
    	let div1;
    	let t1;
    	let div0;
    	let article_class_value;
    	let article_transition;
    	let current;
    	let if_block0 = /*showClose*/ ctx[2] && create_if_block_2$3(ctx);
    	let if_block1 = /*icon*/ ctx[3] && create_if_block_1$5(ctx);
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			article = element("article");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "media-content");
    			add_location(div0, file$8, 102, 6, 2847);
    			attr_dev(div1, "class", "media svelte-1j2lhcz");
    			add_location(div1, file$8, 96, 4, 2678);
    			attr_dev(article, "class", article_class_value = "notification " + /*type*/ ctx[1] + " svelte-1j2lhcz");
    			add_location(article, file$8, 92, 2, 2507);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			if (if_block0) if_block0.m(article, null);
    			append_dev(article, t0);
    			append_dev(article, div1);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*showClose*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$3(ctx);
    					if_block0.c();
    					if_block0.m(article, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*icon*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*icon*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*type*/ 2 && article_class_value !== (article_class_value = "notification " + /*type*/ ctx[1] + " svelte-1j2lhcz")) {
    				attr_dev(article, "class", article_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(default_slot, local);

    			if (local) {
    				add_render_callback(() => {
    					if (!article_transition) article_transition = create_bidirectional_transition(article, fade, {}, true);
    					article_transition.run(1);
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(default_slot, local);

    			if (local) {
    				if (!article_transition) article_transition = create_bidirectional_transition(article, fade, {}, false);
    				article_transition.run(0);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && article_transition) article_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(92:0) {#if active}",
    		ctx
    	});

    	return block;
    }

    // (94:4) {#if showClose}
    function create_if_block_2$3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "delete");
    			attr_dev(button, "aria-label", /*ariaCloseLabel*/ ctx[5]);
    			add_location(button, file$8, 94, 6, 2593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*ariaCloseLabel*/ 32) {
    				attr_dev(button, "aria-label", /*ariaCloseLabel*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(94:4) {#if showClose}",
    		ctx
    	});

    	return block;
    }

    // (98:6) {#if icon}
    function create_if_block_1$5(ctx) {
    	let div;
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				pack: /*iconPack*/ ctx[4],
    				icon: /*newIcon*/ ctx[6],
    				size: "is-large"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icon_1.$$.fragment);
    			attr_dev(div, "class", "media-left");
    			add_location(div, file$8, 98, 8, 2723);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icon_1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*iconPack*/ 16) icon_1_changes.pack = /*iconPack*/ ctx[4];
    			if (dirty & /*newIcon*/ 64) icon_1_changes.icon = /*newIcon*/ ctx[6];
    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(98:6) {#if icon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*active*/ ctx[0] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*active*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*active*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Notification", slots, ['default']);
    	let { type = "" } = $$props;
    	let { active = true } = $$props;
    	let { showClose = true } = $$props;
    	let { autoClose = false } = $$props;
    	let { duration = 2000 } = $$props;
    	let { icon = "" } = $$props;
    	let { iconPack = "" } = $$props;
    	let { ariaCloseLabel = "" } = $$props;

    	/** Text for notification, when used programmatically
     * @svelte-prop {String} message
     * */
    	/** Where the notification will show on the screen when used programmatically
     * @svelte-prop {String} [position=is-top-right]
     * @values <code>is-top</code>, <code>is-bottom</code>, <code>is-top-left</code>, <code>is-top-right</code>, <code>is-bottom-left</code>, <code>is-bottom-right</code>
     * */
    	const dispatch = createEventDispatcher();

    	let newIcon = "";
    	let timer;

    	function close() {
    		$$invalidate(0, active = false);
    		if (timer) clearTimeout(timer);
    		dispatch("close", active);
    	}

    	const writable_props = [
    		"type",
    		"active",
    		"showClose",
    		"autoClose",
    		"duration",
    		"icon",
    		"iconPack",
    		"ariaCloseLabel"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Notification> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("showClose" in $$props) $$invalidate(2, showClose = $$props.showClose);
    		if ("autoClose" in $$props) $$invalidate(8, autoClose = $$props.autoClose);
    		if ("duration" in $$props) $$invalidate(9, duration = $$props.duration);
    		if ("icon" in $$props) $$invalidate(3, icon = $$props.icon);
    		if ("iconPack" in $$props) $$invalidate(4, iconPack = $$props.iconPack);
    		if ("ariaCloseLabel" in $$props) $$invalidate(5, ariaCloseLabel = $$props.ariaCloseLabel);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		fly,
    		fade,
    		Icon,
    		Notice,
    		filterProps,
    		typeToIcon,
    		type,
    		active,
    		showClose,
    		autoClose,
    		duration,
    		icon,
    		iconPack,
    		ariaCloseLabel,
    		dispatch,
    		newIcon,
    		timer,
    		close
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("showClose" in $$props) $$invalidate(2, showClose = $$props.showClose);
    		if ("autoClose" in $$props) $$invalidate(8, autoClose = $$props.autoClose);
    		if ("duration" in $$props) $$invalidate(9, duration = $$props.duration);
    		if ("icon" in $$props) $$invalidate(3, icon = $$props.icon);
    		if ("iconPack" in $$props) $$invalidate(4, iconPack = $$props.iconPack);
    		if ("ariaCloseLabel" in $$props) $$invalidate(5, ariaCloseLabel = $$props.ariaCloseLabel);
    		if ("newIcon" in $$props) $$invalidate(6, newIcon = $$props.newIcon);
    		if ("timer" in $$props) timer = $$props.timer;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*icon, type*/ 10) {
    			 {
    				if (icon === true) {
    					$$invalidate(6, newIcon = typeToIcon(type));
    				} else {
    					$$invalidate(6, newIcon = icon);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*active, autoClose, duration*/ 769) {
    			 {
    				if (active && autoClose) {
    					timer = setTimeout(
    						() => {
    							if (active) close();
    						},
    						duration
    					);
    				}
    			}
    		}
    	};

    	return [
    		active,
    		type,
    		showClose,
    		icon,
    		iconPack,
    		ariaCloseLabel,
    		newIcon,
    		close,
    		autoClose,
    		duration,
    		$$scope,
    		slots
    	];
    }

    class Notification extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			type: 1,
    			active: 0,
    			showClose: 2,
    			autoClose: 8,
    			duration: 9,
    			icon: 3,
    			iconPack: 4,
    			ariaCloseLabel: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notification",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get type() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showClose() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showClose(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoClose() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoClose(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconPack() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconPack(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ariaCloseLabel() {
    		throw new Error("<Notification>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ariaCloseLabel(value) {
    		throw new Error("<Notification>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelma/src/components/Notification/NotificationNotice.svelte generated by Svelte v3.31.2 */

    // (34:2) <Notification {...notificationProps}>
    function create_default_slot_1(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*message*/ ctx[0], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*message*/ 1) html_tag.p(/*message*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(34:2) <Notification {...notificationProps}>",
    		ctx
    	});

    	return block;
    }

    // (33:0) <Notice {...props} transitionOut={true}>
    function create_default_slot(ctx) {
    	let notification;
    	let current;
    	const notification_spread_levels = [/*notificationProps*/ ctx[2]];

    	let notification_props = {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < notification_spread_levels.length; i += 1) {
    		notification_props = assign(notification_props, notification_spread_levels[i]);
    	}

    	notification = new Notification({
    			props: notification_props,
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(notification.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notification, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notification_changes = (dirty & /*notificationProps*/ 4)
    			? get_spread_update(notification_spread_levels, [get_spread_object(/*notificationProps*/ ctx[2])])
    			: {};

    			if (dirty & /*$$scope, message*/ 129) {
    				notification_changes.$$scope = { dirty, ctx };
    			}

    			notification.$set(notification_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notification.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notification.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notification, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(33:0) <Notice {...props} transitionOut={true}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let notice;
    	let current;
    	const notice_spread_levels = [/*props*/ ctx[1], { transitionOut: true }];

    	let notice_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < notice_spread_levels.length; i += 1) {
    		notice_props = assign(notice_props, notice_spread_levels[i]);
    	}

    	notice = new Notice({ props: notice_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(notice.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(notice, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const notice_changes = (dirty & /*props*/ 2)
    			? get_spread_update(notice_spread_levels, [get_spread_object(/*props*/ ctx[1]), notice_spread_levels[1]])
    			: {};

    			if (dirty & /*$$scope, notificationProps, message*/ 133) {
    				notice_changes.$$scope = { dirty, ctx };
    			}

    			notice.$set(notice_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notice.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notice.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notice, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let props;
    	let notificationProps;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NotificationNotice", slots, []);
    	let { message } = $$props;
    	let { duration = 2000 } = $$props;
    	let { position = "is-top-right" } = $$props;

    	function removeNonNoficationProps(props) {
    		const newProps = {};
    		const blacklist = ["duration", "message", "position"];

    		Object.keys(props).forEach(key => {
    			if (!blacklist.includes(key)) newProps[key] = props[key];
    		});

    		return newProps;
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("message" in $$new_props) $$invalidate(0, message = $$new_props.message);
    		if ("duration" in $$new_props) $$invalidate(3, duration = $$new_props.duration);
    		if ("position" in $$new_props) $$invalidate(4, position = $$new_props.position);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		fly,
    		fade,
    		Notice,
    		filterProps,
    		Notification,
    		message,
    		duration,
    		position,
    		removeNonNoficationProps,
    		props,
    		notificationProps
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ("message" in $$props) $$invalidate(0, message = $$new_props.message);
    		if ("duration" in $$props) $$invalidate(3, duration = $$new_props.duration);
    		if ("position" in $$props) $$invalidate(4, position = $$new_props.position);
    		if ("props" in $$props) $$invalidate(1, props = $$new_props.props);
    		if ("notificationProps" in $$props) $$invalidate(2, notificationProps = $$new_props.notificationProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(1, props = {
    			...filterProps($$props),
    			duration,
    			position
    		});

    		 $$invalidate(2, notificationProps = { ...removeNonNoficationProps($$props) });
    	};

    	$$props = exclude_internal_props($$props);
    	return [message, props, notificationProps, duration, position];
    }

    class NotificationNotice extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { message: 0, duration: 3, position: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotificationNotice",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*message*/ ctx[0] === undefined && !("message" in props)) {
    			console.warn("<NotificationNotice> was created without expected prop 'message'");
    		}
    	}

    	get message() {
    		throw new Error("<NotificationNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<NotificationNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<NotificationNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<NotificationNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<NotificationNotice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<NotificationNotice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    Notification.create = create;

    function create(props) {
      if (typeof props === 'string') props = { message: props };

      const notification = new NotificationNotice({
        target: document.body,
        props,
        intro: true,
      });

      notification.$on('destroyed', notification.$destroy);

      return notification
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* node_modules/svelma/src/components/Progress.svelte generated by Svelte v3.31.2 */
    const file$9 = "node_modules/svelma/src/components/Progress.svelte";

    function create_fragment$a(ctx) {
    	let progress;
    	let t0;
    	let t1;
    	let progress_class_value;

    	const block = {
    		c: function create() {
    			progress = element("progress");
    			t0 = text(/*value*/ ctx[0]);
    			t1 = text("%");
    			attr_dev(progress, "class", progress_class_value = "progress " + /*type*/ ctx[1]);
    			attr_dev(progress, "max", /*max*/ ctx[2]);
    			add_location(progress, file$9, 45, 0, 955);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, progress, anchor);
    			append_dev(progress, t0);
    			append_dev(progress, t1);
    			/*progress_binding*/ ctx[6](progress);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t0, /*value*/ ctx[0]);

    			if (dirty & /*type*/ 2 && progress_class_value !== (progress_class_value = "progress " + /*type*/ ctx[1])) {
    				attr_dev(progress, "class", progress_class_value);
    			}

    			if (dirty & /*max*/ 4) {
    				attr_dev(progress, "max", /*max*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(progress);
    			/*progress_binding*/ ctx[6](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Progress", slots, []);
    	let { value = null } = $$props;
    	let { type = "" } = $$props;
    	let { max = 100 } = $$props;
    	let { duration = 400 } = $$props;
    	let { easing = cubicOut } = $$props;
    	let el;
    	let newValue = tweened(value, { duration, easing });

    	newValue.subscribe(val => {
    		if (el && typeof (value !== undefined)) {
    			el.setAttribute("value", get_store_value(newValue));
    		}
    	});

    	const writable_props = ["value", "type", "max", "duration", "easing"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Progress> was created with unknown prop '${key}'`);
    	});

    	function progress_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			el = $$value;
    			$$invalidate(3, el);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("max" in $$props) $$invalidate(2, max = $$props.max);
    		if ("duration" in $$props) $$invalidate(4, duration = $$props.duration);
    		if ("easing" in $$props) $$invalidate(5, easing = $$props.easing);
    	};

    	$$self.$capture_state = () => ({
    		get: get_store_value,
    		tweened,
    		cubicOut,
    		value,
    		type,
    		max,
    		duration,
    		easing,
    		el,
    		newValue
    	});

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("max" in $$props) $$invalidate(2, max = $$props.max);
    		if ("duration" in $$props) $$invalidate(4, duration = $$props.duration);
    		if ("easing" in $$props) $$invalidate(5, easing = $$props.easing);
    		if ("el" in $$props) $$invalidate(3, el = $$props.el);
    		if ("newValue" in $$props) $$invalidate(7, newValue = $$props.newValue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 1) {
    			 newValue.set(value);
    		}
    	};

    	return [value, type, max, el, duration, easing, progress_binding];
    }

    class Progress extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			value: 0,
    			type: 1,
    			max: 2,
    			duration: 4,
    			easing: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Progress",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get value() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get easing() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set easing(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelma/src/components/Select.svelte generated by Svelte v3.31.2 */
    const file$a = "node_modules/svelma/src/components/Select.svelte";

    // (134:8) {:else}
    function create_else_block$1(ctx) {
    	let select;
    	let if_block_anchor;
    	let select_disabled_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*placeholder*/ ctx[2] && /*selected*/ ctx[0] === "" && create_if_block_3$3(ctx);
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	const block = {
    		c: function create() {
    			select = element("select");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    			select.multiple = true;
    			attr_dev(select, "size", /*nativeSize*/ ctx[5]);
    			select.disabled = select_disabled_value = /*disabled*/ ctx[12] ? "disabled" : "";
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler_1*/ ctx[22].call(select));
    			add_location(select, file$a, 134, 12, 3615);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			if (if_block) if_block.m(select, null);
    			append_dev(select, if_block_anchor);

    			if (default_slot) {
    				default_slot.m(select, null);
    			}

    			select_options(select, /*selected*/ ctx[0]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler_1*/ ctx[22]),
    					listen_dev(select, "change", /*onChange*/ ctx[15], false, false, false),
    					listen_dev(select, "blur", /*onBlur*/ ctx[16], false, false, false),
    					listen_dev(select, "hover", /*onHover*/ ctx[17], false, false, false),
    					listen_dev(select, "focus", /*onFocus*/ ctx[18], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*placeholder*/ ctx[2] && /*selected*/ ctx[0] === "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_3$3(ctx);
    					if_block.c();
    					if_block.m(select, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 524288) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*nativeSize*/ 32) {
    				attr_dev(select, "size", /*nativeSize*/ ctx[5]);
    			}

    			if (!current || dirty & /*disabled*/ 4096 && select_disabled_value !== (select_disabled_value = /*disabled*/ ctx[12] ? "disabled" : "")) {
    				prop_dev(select, "disabled", select_disabled_value);
    			}

    			if (dirty & /*selected*/ 1) {
    				select_options(select, /*selected*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(134:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (114:8) {#if !multiple}
    function create_if_block_1$6(ctx) {
    	let select;
    	let if_block_anchor;
    	let select_disabled_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*placeholder*/ ctx[2] && /*selected*/ ctx[0] === "" && create_if_block_2$4(ctx);
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);

    	const block = {
    		c: function create() {
    			select = element("select");
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (default_slot) default_slot.c();
    			attr_dev(select, "size", /*nativeSize*/ ctx[5]);
    			select.disabled = select_disabled_value = /*disabled*/ ctx[12] ? "disabled" : "";
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[21].call(select));
    			add_location(select, file$a, 114, 12, 2996);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			if (if_block) if_block.m(select, null);
    			append_dev(select, if_block_anchor);

    			if (default_slot) {
    				default_slot.m(select, null);
    			}

    			select_option(select, /*selected*/ ctx[0]);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[21]),
    					listen_dev(select, "change", /*onChange*/ ctx[15], false, false, false),
    					listen_dev(select, "blur", /*onBlur*/ ctx[16], false, false, false),
    					listen_dev(select, "hover", /*onHover*/ ctx[17], false, false, false),
    					listen_dev(select, "focus", /*onFocus*/ ctx[18], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*placeholder*/ ctx[2] && /*selected*/ ctx[0] === "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$4(ctx);
    					if_block.c();
    					if_block.m(select, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 524288) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[19], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*nativeSize*/ 32) {
    				attr_dev(select, "size", /*nativeSize*/ ctx[5]);
    			}

    			if (!current || dirty & /*disabled*/ 4096 && select_disabled_value !== (select_disabled_value = /*disabled*/ ctx[12] ? "disabled" : "")) {
    				prop_dev(select, "disabled", select_disabled_value);
    			}

    			if (dirty & /*selected*/ 1) {
    				select_option(select, /*selected*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(114:8) {#if !multiple}",
    		ctx
    	});

    	return block;
    }

    // (145:16) {#if placeholder && selected === ''}
    function create_if_block_3$3(ctx) {
    	let option;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(/*placeholder*/ ctx[2]);
    			t1 = space();
    			option.__value = "";
    			option.value = option.__value;
    			option.disabled = true;
    			option.hidden = true;
    			add_location(option, file$a, 145, 20, 3989);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 4) set_data_dev(t0, /*placeholder*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$3.name,
    		type: "if",
    		source: "(145:16) {#if placeholder && selected === ''}",
    		ctx
    	});

    	return block;
    }

    // (124:16) {#if placeholder && selected === ''}
    function create_if_block_2$4(ctx) {
    	let option;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(/*placeholder*/ ctx[2]);
    			t1 = space();
    			option.__value = "";
    			option.value = option.__value;
    			option.disabled = true;
    			option.hidden = true;
    			add_location(option, file$a, 124, 20, 3345);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 4) set_data_dev(t0, /*placeholder*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$4.name,
    		type: "if",
    		source: "(124:16) {#if placeholder && selected === ''}",
    		ctx
    	});

    	return block;
    }

    // (158:4) {#if icon}
    function create_if_block$7(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				isLeft: true,
    				icon: /*icon*/ ctx[10],
    				pack: /*iconPack*/ ctx[11],
    				size: /*size*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty & /*icon*/ 1024) icon_1_changes.icon = /*icon*/ ctx[10];
    			if (dirty & /*iconPack*/ 2048) icon_1_changes.pack = /*iconPack*/ ctx[11];
    			if (dirty & /*size*/ 16) icon_1_changes.size = /*size*/ ctx[4];
    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(158:4) {#if icon}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let span;
    	let current_block_type_index;
    	let if_block0;
    	let span_class_value;
    	let t;
    	let current;
    	const if_block_creators = [create_if_block_1$6, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*multiple*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*icon*/ ctx[10] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(span, "class", span_class_value = "select " + /*size*/ ctx[4] + " " + /*type*/ ctx[1]);
    			toggle_class(span, "is-fullwidth", /*expanded*/ ctx[6]);
    			toggle_class(span, "is-loading", /*loading*/ ctx[9]);
    			toggle_class(span, "is-multiple", /*multiple*/ ctx[3]);
    			toggle_class(span, "is-rounded", /*rounded*/ ctx[7]);
    			toggle_class(span, "is-empty", /*selected*/ ctx[0] === "");
    			toggle_class(span, "is-focused", /*focused*/ ctx[13]);
    			toggle_class(span, "is-hovered", /*hovered*/ ctx[14]);
    			toggle_class(span, "is-required", /*required*/ ctx[8]);
    			add_location(span, file$a, 103, 4, 2621);
    			attr_dev(div, "class", "control");
    			toggle_class(div, "is-expanded", /*expanded*/ ctx[6]);
    			toggle_class(div, "has-icons-left", /*icon*/ ctx[10]);
    			add_location(div, file$a, 99, 0, 2526);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			if_blocks[current_block_type_index].m(span, null);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(span, null);
    			}

    			if (!current || dirty & /*size, type*/ 18 && span_class_value !== (span_class_value = "select " + /*size*/ ctx[4] + " " + /*type*/ ctx[1])) {
    				attr_dev(span, "class", span_class_value);
    			}

    			if (dirty & /*size, type, expanded*/ 82) {
    				toggle_class(span, "is-fullwidth", /*expanded*/ ctx[6]);
    			}

    			if (dirty & /*size, type, loading*/ 530) {
    				toggle_class(span, "is-loading", /*loading*/ ctx[9]);
    			}

    			if (dirty & /*size, type, multiple*/ 26) {
    				toggle_class(span, "is-multiple", /*multiple*/ ctx[3]);
    			}

    			if (dirty & /*size, type, rounded*/ 146) {
    				toggle_class(span, "is-rounded", /*rounded*/ ctx[7]);
    			}

    			if (dirty & /*size, type, selected*/ 19) {
    				toggle_class(span, "is-empty", /*selected*/ ctx[0] === "");
    			}

    			if (dirty & /*size, type, focused*/ 8210) {
    				toggle_class(span, "is-focused", /*focused*/ ctx[13]);
    			}

    			if (dirty & /*size, type, hovered*/ 16402) {
    				toggle_class(span, "is-hovered", /*hovered*/ ctx[14]);
    			}

    			if (dirty & /*size, type, required*/ 274) {
    				toggle_class(span, "is-required", /*required*/ ctx[8]);
    			}

    			if (/*icon*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*icon*/ 1024) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$7(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*expanded*/ 64) {
    				toggle_class(div, "is-expanded", /*expanded*/ ctx[6]);
    			}

    			if (dirty & /*icon*/ 1024) {
    				toggle_class(div, "has-icons-left", /*icon*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Select", slots, ['default']);
    	let { selected = "" } = $$props;
    	let { type = "" } = $$props;
    	let { placeholder = "" } = $$props;
    	let { multiple = false } = $$props;
    	let { size = "" } = $$props;
    	let { nativeSize } = $$props;
    	let { expanded = false } = $$props;
    	let { rounded = false } = $$props;
    	let { required = false } = $$props;
    	let { loading = false } = $$props;
    	let { icon = "" } = $$props;
    	let { iconPack = "mdi" } = $$props;
    	let { disabled = false } = $$props;
    	const dispatch = createEventDispatcher();
    	let focused = false;
    	let hovered = false;

    	function onChange() {
    		dispatch("input", selected);
    	}

    	function onBlur() {
    		$$invalidate(13, focused = false);
    		dispatch("blur");
    	}

    	function onHover() {
    		$$invalidate(14, hovered = true);
    		dispatch("hover");
    	}

    	function onFocus() {
    		$$invalidate(13, focused = true);
    		dispatch("focus");
    	}

    	const writable_props = [
    		"selected",
    		"type",
    		"placeholder",
    		"multiple",
    		"size",
    		"nativeSize",
    		"expanded",
    		"rounded",
    		"required",
    		"loading",
    		"icon",
    		"iconPack",
    		"disabled"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(0, selected);
    	}

    	function select_change_handler_1() {
    		selected = select_multiple_value(this);
    		$$invalidate(0, selected);
    	}

    	$$self.$$set = $$props => {
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("multiple" in $$props) $$invalidate(3, multiple = $$props.multiple);
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("nativeSize" in $$props) $$invalidate(5, nativeSize = $$props.nativeSize);
    		if ("expanded" in $$props) $$invalidate(6, expanded = $$props.expanded);
    		if ("rounded" in $$props) $$invalidate(7, rounded = $$props.rounded);
    		if ("required" in $$props) $$invalidate(8, required = $$props.required);
    		if ("loading" in $$props) $$invalidate(9, loading = $$props.loading);
    		if ("icon" in $$props) $$invalidate(10, icon = $$props.icon);
    		if ("iconPack" in $$props) $$invalidate(11, iconPack = $$props.iconPack);
    		if ("disabled" in $$props) $$invalidate(12, disabled = $$props.disabled);
    		if ("$$scope" in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Icon,
    		selected,
    		type,
    		placeholder,
    		multiple,
    		size,
    		nativeSize,
    		expanded,
    		rounded,
    		required,
    		loading,
    		icon,
    		iconPack,
    		disabled,
    		dispatch,
    		focused,
    		hovered,
    		onChange,
    		onBlur,
    		onHover,
    		onFocus
    	});

    	$$self.$inject_state = $$props => {
    		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("placeholder" in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ("multiple" in $$props) $$invalidate(3, multiple = $$props.multiple);
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("nativeSize" in $$props) $$invalidate(5, nativeSize = $$props.nativeSize);
    		if ("expanded" in $$props) $$invalidate(6, expanded = $$props.expanded);
    		if ("rounded" in $$props) $$invalidate(7, rounded = $$props.rounded);
    		if ("required" in $$props) $$invalidate(8, required = $$props.required);
    		if ("loading" in $$props) $$invalidate(9, loading = $$props.loading);
    		if ("icon" in $$props) $$invalidate(10, icon = $$props.icon);
    		if ("iconPack" in $$props) $$invalidate(11, iconPack = $$props.iconPack);
    		if ("disabled" in $$props) $$invalidate(12, disabled = $$props.disabled);
    		if ("focused" in $$props) $$invalidate(13, focused = $$props.focused);
    		if ("hovered" in $$props) $$invalidate(14, hovered = $$props.hovered);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selected,
    		type,
    		placeholder,
    		multiple,
    		size,
    		nativeSize,
    		expanded,
    		rounded,
    		required,
    		loading,
    		icon,
    		iconPack,
    		disabled,
    		focused,
    		hovered,
    		onChange,
    		onBlur,
    		onHover,
    		onFocus,
    		$$scope,
    		slots,
    		select_change_handler,
    		select_change_handler_1
    	];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			selected: 0,
    			type: 1,
    			placeholder: 2,
    			multiple: 3,
    			size: 4,
    			nativeSize: 5,
    			expanded: 6,
    			rounded: 7,
    			required: 8,
    			loading: 9,
    			icon: 10,
    			iconPack: 11,
    			disabled: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nativeSize*/ ctx[5] === undefined && !("nativeSize" in props)) {
    			console.warn("<Select> was created without expected prop 'nativeSize'");
    		}
    	}

    	get selected() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nativeSize() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nativeSize(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expanded() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconPack() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconPack(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelma/src/components/Switch.svelte generated by Svelte v3.31.2 */

    const file$b = "node_modules/svelma/src/components/Switch.svelte";

    function create_fragment$c(ctx) {
    	let label_1;
    	let input_1;
    	let t0;
    	let div;
    	let div_class_value;
    	let t1;
    	let span;
    	let label_1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			input_1 = element("input");
    			t0 = space();
    			div = element("div");
    			t1 = space();
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(input_1, "type", "checkbox");
    			attr_dev(input_1, "class", "svelte-1ulb88c");
    			add_location(input_1, file$b, 99, 2, 2509);
    			attr_dev(div, "class", div_class_value = "check " + /*newBackground*/ ctx[4] + " svelte-1ulb88c");
    			add_location(div, file$b, 101, 2, 2587);
    			attr_dev(span, "class", "control-label svelte-1ulb88c");
    			add_location(span, file$b, 103, 2, 2632);
    			attr_dev(label_1, "ref", "label");
    			attr_dev(label_1, "class", label_1_class_value = "switch " + /*size*/ ctx[1] + " svelte-1ulb88c");
    			add_location(label_1, file$b, 98, 0, 2447);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, input_1);
    			input_1.checked = /*checked*/ ctx[0];
    			/*input_1_binding*/ ctx[12](input_1);
    			append_dev(label_1, t0);
    			append_dev(label_1, div);
    			append_dev(label_1, t1);
    			append_dev(label_1, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			/*label_1_binding*/ ctx[13](label_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "change", /*input_1_change_handler*/ ctx[11]),
    					listen_dev(input_1, "input", /*input_handler*/ ctx[9], false, false, false),
    					listen_dev(input_1, "click", /*click_handler*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*checked*/ 1) {
    				input_1.checked = /*checked*/ ctx[0];
    			}

    			if (!current || dirty & /*newBackground*/ 16 && div_class_value !== (div_class_value = "check " + /*newBackground*/ ctx[4] + " svelte-1ulb88c")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 128) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[7], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*size*/ 2 && label_1_class_value !== (label_1_class_value = "switch " + /*size*/ ctx[1] + " svelte-1ulb88c")) {
    				attr_dev(label_1, "class", label_1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			/*input_1_binding*/ ctx[12](null);
    			if (default_slot) default_slot.d(detaching);
    			/*label_1_binding*/ ctx[13](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let newBackground;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Switch", slots, ['default']);
    	let { checked = false } = $$props;
    	let { type = "is-primary" } = $$props;
    	let { size = "" } = $$props;
    	let { disabled = false } = $$props;
    	let label;
    	let input;
    	const writable_props = ["checked", "type", "size", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	function input_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function input_1_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			input = $$value;
    			$$invalidate(3, input);
    		});
    	}

    	function label_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			label = $$value;
    			$$invalidate(2, label);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("type" in $$props) $$invalidate(5, type = $$props.type);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("disabled" in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		checked,
    		type,
    		size,
    		disabled,
    		label,
    		input,
    		newBackground
    	});

    	$$self.$inject_state = $$props => {
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    		if ("type" in $$props) $$invalidate(5, type = $$props.type);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("disabled" in $$props) $$invalidate(6, disabled = $$props.disabled);
    		if ("label" in $$props) $$invalidate(2, label = $$props.label);
    		if ("input" in $$props) $$invalidate(3, input = $$props.input);
    		if ("newBackground" in $$props) $$invalidate(4, newBackground = $$props.newBackground);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type*/ 32) {
    			 $$invalidate(4, newBackground = type && type.replace(/^is-(.*)/, "has-background-$1") || "");
    		}

    		if ($$self.$$.dirty & /*input, disabled, label*/ 76) {
    			 {
    				if (input) {
    					if (disabled) {
    						label.setAttribute("disabled", "disabled");
    						input.setAttribute("disabled", "disabled");
    					} else {
    						label.removeAttribute("disabled");
    						input.removeAttribute("disabled");
    					}
    				}
    			}
    		}
    	};

    	return [
    		checked,
    		size,
    		label,
    		input,
    		newBackground,
    		type,
    		disabled,
    		$$scope,
    		slots,
    		input_handler,
    		click_handler,
    		input_1_change_handler,
    		input_1_binding,
    		label_1_binding
    	];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			checked: 0,
    			type: 5,
    			size: 1,
    			disabled: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get checked() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelma/src/components/Tag/Tag.svelte generated by Svelte v3.31.2 */
    const file$c = "node_modules/svelma/src/components/Tag/Tag.svelte";

    // (74:0) {:else}
    function create_else_block$2(ctx) {
    	let span1;
    	let span0;
    	let t;
    	let span1_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);
    	let if_block = /*closable*/ ctx[3] && create_if_block_1$7(ctx);

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			span0 = element("span");
    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			toggle_class(span0, "has-ellipsis", /*ellipsis*/ ctx[5]);
    			add_location(span0, file$c, 77, 8, 2241);
    			attr_dev(span1, "class", span1_class_value = "tag " + /*type*/ ctx[0] + " " + /*size*/ ctx[1]);
    			toggle_class(span1, "is-rounded", /*rounded*/ ctx[2]);
    			add_location(span1, file$c, 74, 4, 2157);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			append_dev(span1, span0);

    			if (default_slot) {
    				default_slot.m(span0, null);
    			}

    			append_dev(span1, t);
    			if (if_block) if_block.m(span1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
    				}
    			}

    			if (dirty & /*ellipsis*/ 32) {
    				toggle_class(span0, "has-ellipsis", /*ellipsis*/ ctx[5]);
    			}

    			if (/*closable*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$7(ctx);
    					if_block.c();
    					if_block.m(span1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (!current || dirty & /*type, size*/ 3 && span1_class_value !== (span1_class_value = "tag " + /*type*/ ctx[0] + " " + /*size*/ ctx[1])) {
    				attr_dev(span1, "class", span1_class_value);
    			}

    			if (dirty & /*type, size, rounded*/ 7) {
    				toggle_class(span1, "is-rounded", /*rounded*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			if (default_slot) default_slot.d(detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(74:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:0) {#if attached && closable}
    function create_if_block$8(ctx) {
    	let div;
    	let span1;
    	let span0;
    	let span1_class_value;
    	let t;
    	let a;
    	let a_class_value;
    	let a_tabindex_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span1 = element("span");
    			span0 = element("span");
    			if (default_slot) default_slot.c();
    			t = space();
    			a = element("a");
    			toggle_class(span0, "has-ellipsis", /*ellipsis*/ ctx[5]);
    			add_location(span0, file$c, 60, 12, 1757);
    			attr_dev(span1, "class", span1_class_value = "tag " + /*type*/ ctx[0] + " " + /*size*/ ctx[1]);
    			toggle_class(span1, "is-rounded", /*rounded*/ ctx[2]);
    			add_location(span1, file$c, 57, 8, 1661);
    			attr_dev(a, "role", "button");
    			attr_dev(a, "class", a_class_value = "tag is-delete " + /*size*/ ctx[1]);
    			attr_dev(a, "disabled", /*disabled*/ ctx[7]);
    			attr_dev(a, "tabindex", a_tabindex_value = /*tabstop*/ ctx[6] ? 0 : false);
    			toggle_class(a, "is-rounded", /*rounded*/ ctx[2]);
    			add_location(a, file$c, 64, 8, 1862);
    			attr_dev(div, "class", "tags has-addons");
    			add_location(div, file$c, 56, 4, 1623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span1);
    			append_dev(span1, span0);

    			if (default_slot) {
    				default_slot.m(span0, null);
    			}

    			append_dev(div, t);
    			append_dev(div, a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*close*/ ctx[8], false, false, false),
    					listen_dev(a, "keyup", prevent_default(/*keyup_handler*/ ctx[11]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 512) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, null, null);
    				}
    			}

    			if (dirty & /*ellipsis*/ 32) {
    				toggle_class(span0, "has-ellipsis", /*ellipsis*/ ctx[5]);
    			}

    			if (!current || dirty & /*type, size*/ 3 && span1_class_value !== (span1_class_value = "tag " + /*type*/ ctx[0] + " " + /*size*/ ctx[1])) {
    				attr_dev(span1, "class", span1_class_value);
    			}

    			if (dirty & /*type, size, rounded*/ 7) {
    				toggle_class(span1, "is-rounded", /*rounded*/ ctx[2]);
    			}

    			if (!current || dirty & /*size*/ 2 && a_class_value !== (a_class_value = "tag is-delete " + /*size*/ ctx[1])) {
    				attr_dev(a, "class", a_class_value);
    			}

    			if (!current || dirty & /*disabled*/ 128) {
    				attr_dev(a, "disabled", /*disabled*/ ctx[7]);
    			}

    			if (!current || dirty & /*tabstop*/ 64 && a_tabindex_value !== (a_tabindex_value = /*tabstop*/ ctx[6] ? 0 : false)) {
    				attr_dev(a, "tabindex", a_tabindex_value);
    			}

    			if (dirty & /*size, rounded*/ 6) {
    				toggle_class(a, "is-rounded", /*rounded*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(56:0) {#if attached && closable}",
    		ctx
    	});

    	return block;
    }

    // (81:8) {#if closable}
    function create_if_block_1$7(ctx) {
    	let a;
    	let a_tabindex_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			attr_dev(a, "role", "button");
    			attr_dev(a, "class", "delete is-small");
    			attr_dev(a, "disabled", /*disabled*/ ctx[7]);
    			attr_dev(a, "tabindex", a_tabindex_value = /*tabstop*/ ctx[6] ? 0 : false);
    			add_location(a, file$c, 81, 12, 2349);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(a, "click", /*close*/ ctx[8], false, false, false),
    					listen_dev(a, "keyup", prevent_default(/*keyup_handler_1*/ ctx[12]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*disabled*/ 128) {
    				attr_dev(a, "disabled", /*disabled*/ ctx[7]);
    			}

    			if (dirty & /*tabstop*/ 64 && a_tabindex_value !== (a_tabindex_value = /*tabstop*/ ctx[6] ? 0 : false)) {
    				attr_dev(a, "tabindex", a_tabindex_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$7.name,
    		type: "if",
    		source: "(81:8) {#if closable}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$8, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*attached*/ ctx[4] && /*closable*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tag", slots, ['default']);
    	let { type = "" } = $$props;
    	let { size = "" } = $$props;
    	let { rounded = false } = $$props;
    	let { closable = false } = $$props;
    	let { attached = false } = $$props;
    	let { ellipsis = false } = $$props;
    	let { tabstop = true } = $$props;
    	let { disabled = false } = $$props;
    	const dispatch = createEventDispatcher();

    	function close() {
    		if (this.disabled) return;
    		dispatch("close");
    	}

    	const writable_props = [
    		"type",
    		"size",
    		"rounded",
    		"closable",
    		"attached",
    		"ellipsis",
    		"tabstop",
    		"disabled"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tag> was created with unknown prop '${key}'`);
    	});

    	const keyup_handler = e => isDeleteKey() && close();
    	const keyup_handler_1 = e => isDeleteKey() && close();

    	$$self.$$set = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("rounded" in $$props) $$invalidate(2, rounded = $$props.rounded);
    		if ("closable" in $$props) $$invalidate(3, closable = $$props.closable);
    		if ("attached" in $$props) $$invalidate(4, attached = $$props.attached);
    		if ("ellipsis" in $$props) $$invalidate(5, ellipsis = $$props.ellipsis);
    		if ("tabstop" in $$props) $$invalidate(6, tabstop = $$props.tabstop);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$props.disabled);
    		if ("$$scope" in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		isDeleteKey,
    		createEventDispatcher,
    		type,
    		size,
    		rounded,
    		closable,
    		attached,
    		ellipsis,
    		tabstop,
    		disabled,
    		dispatch,
    		close
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(0, type = $$props.type);
    		if ("size" in $$props) $$invalidate(1, size = $$props.size);
    		if ("rounded" in $$props) $$invalidate(2, rounded = $$props.rounded);
    		if ("closable" in $$props) $$invalidate(3, closable = $$props.closable);
    		if ("attached" in $$props) $$invalidate(4, attached = $$props.attached);
    		if ("ellipsis" in $$props) $$invalidate(5, ellipsis = $$props.ellipsis);
    		if ("tabstop" in $$props) $$invalidate(6, tabstop = $$props.tabstop);
    		if ("disabled" in $$props) $$invalidate(7, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		type,
    		size,
    		rounded,
    		closable,
    		attached,
    		ellipsis,
    		tabstop,
    		disabled,
    		close,
    		$$scope,
    		slots,
    		keyup_handler,
    		keyup_handler_1
    	];
    }

    class Tag extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			type: 0,
    			size: 1,
    			rounded: 2,
    			closable: 3,
    			attached: 4,
    			ellipsis: 5,
    			tabstop: 6,
    			disabled: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tag",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get type() {
    		throw new Error("<Tag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Tag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Tag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Tag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Tag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Tag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closable() {
    		throw new Error("<Tag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closable(value) {
    		throw new Error("<Tag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get attached() {
    		throw new Error("<Tag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set attached(value) {
    		throw new Error("<Tag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ellipsis() {
    		throw new Error("<Tag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ellipsis(value) {
    		throw new Error("<Tag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabstop() {
    		throw new Error("<Tag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabstop(value) {
    		throw new Error("<Tag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Tag>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Tag>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelma/src/components/Tag/Taglist.svelte generated by Svelte v3.31.2 */

    const file$d = "node_modules/svelma/src/components/Tag/Taglist.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "tags");
    			toggle_class(div, "has-addons", /*attached*/ ctx[0]);
    			add_location(div, file$d, 8, 0, 147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (dirty & /*attached*/ 1) {
    				toggle_class(div, "has-addons", /*attached*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Taglist", slots, ['default']);
    	let { attached = false } = $$props;
    	const writable_props = ["attached"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Taglist> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("attached" in $$props) $$invalidate(0, attached = $$props.attached);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ attached });

    	$$self.$inject_state = $$props => {
    		if ("attached" in $$props) $$invalidate(0, attached = $$props.attached);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [attached, $$scope, slots];
    }

    class Taglist extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { attached: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Taglist",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get attached() {
    		throw new Error("<Taglist>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set attached(value) {
    		throw new Error("<Taglist>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // generated by genversion
    const version = '1.22.4';

    // constants.ts
    const DEFAULT_HEADERS = { 'X-Client-Info': `supabase-js/${version}` };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var browserPonyfill = createCommonjsModule(function (module, exports) {
    var global = typeof self !== 'undefined' ? self : commonjsGlobal;
    var __self__ = (function () {
    function F() {
    this.fetch = false;
    this.DOMException = global.DOMException;
    }
    F.prototype = global;
    return new F();
    })();
    (function(self) {

    var irrelevant = (function (exports) {

      var support = {
        searchParams: 'URLSearchParams' in self,
        iterable: 'Symbol' in self && 'iterator' in Symbol,
        blob:
          'FileReader' in self &&
          'Blob' in self &&
          (function() {
            try {
              new Blob();
              return true
            } catch (e) {
              return false
            }
          })(),
        formData: 'FormData' in self,
        arrayBuffer: 'ArrayBuffer' in self
      };

      function isDataView(obj) {
        return obj && DataView.prototype.isPrototypeOf(obj)
      }

      if (support.arrayBuffer) {
        var viewClasses = [
          '[object Int8Array]',
          '[object Uint8Array]',
          '[object Uint8ClampedArray]',
          '[object Int16Array]',
          '[object Uint16Array]',
          '[object Int32Array]',
          '[object Uint32Array]',
          '[object Float32Array]',
          '[object Float64Array]'
        ];

        var isArrayBufferView =
          ArrayBuffer.isView ||
          function(obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
          };
      }

      function normalizeName(name) {
        if (typeof name !== 'string') {
          name = String(name);
        }
        if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
          throw new TypeError('Invalid character in header field name')
        }
        return name.toLowerCase()
      }

      function normalizeValue(value) {
        if (typeof value !== 'string') {
          value = String(value);
        }
        return value
      }

      // Build a destructive iterator for the value list
      function iteratorFor(items) {
        var iterator = {
          next: function() {
            var value = items.shift();
            return {done: value === undefined, value: value}
          }
        };

        if (support.iterable) {
          iterator[Symbol.iterator] = function() {
            return iterator
          };
        }

        return iterator
      }

      function Headers(headers) {
        this.map = {};

        if (headers instanceof Headers) {
          headers.forEach(function(value, name) {
            this.append(name, value);
          }, this);
        } else if (Array.isArray(headers)) {
          headers.forEach(function(header) {
            this.append(header[0], header[1]);
          }, this);
        } else if (headers) {
          Object.getOwnPropertyNames(headers).forEach(function(name) {
            this.append(name, headers[name]);
          }, this);
        }
      }

      Headers.prototype.append = function(name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        var oldValue = this.map[name];
        this.map[name] = oldValue ? oldValue + ', ' + value : value;
      };

      Headers.prototype['delete'] = function(name) {
        delete this.map[normalizeName(name)];
      };

      Headers.prototype.get = function(name) {
        name = normalizeName(name);
        return this.has(name) ? this.map[name] : null
      };

      Headers.prototype.has = function(name) {
        return this.map.hasOwnProperty(normalizeName(name))
      };

      Headers.prototype.set = function(name, value) {
        this.map[normalizeName(name)] = normalizeValue(value);
      };

      Headers.prototype.forEach = function(callback, thisArg) {
        for (var name in this.map) {
          if (this.map.hasOwnProperty(name)) {
            callback.call(thisArg, this.map[name], name, this);
          }
        }
      };

      Headers.prototype.keys = function() {
        var items = [];
        this.forEach(function(value, name) {
          items.push(name);
        });
        return iteratorFor(items)
      };

      Headers.prototype.values = function() {
        var items = [];
        this.forEach(function(value) {
          items.push(value);
        });
        return iteratorFor(items)
      };

      Headers.prototype.entries = function() {
        var items = [];
        this.forEach(function(value, name) {
          items.push([name, value]);
        });
        return iteratorFor(items)
      };

      if (support.iterable) {
        Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
      }

      function consumed(body) {
        if (body.bodyUsed) {
          return Promise.reject(new TypeError('Already read'))
        }
        body.bodyUsed = true;
      }

      function fileReaderReady(reader) {
        return new Promise(function(resolve, reject) {
          reader.onload = function() {
            resolve(reader.result);
          };
          reader.onerror = function() {
            reject(reader.error);
          };
        })
      }

      function readBlobAsArrayBuffer(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsArrayBuffer(blob);
        return promise
      }

      function readBlobAsText(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsText(blob);
        return promise
      }

      function readArrayBufferAsText(buf) {
        var view = new Uint8Array(buf);
        var chars = new Array(view.length);

        for (var i = 0; i < view.length; i++) {
          chars[i] = String.fromCharCode(view[i]);
        }
        return chars.join('')
      }

      function bufferClone(buf) {
        if (buf.slice) {
          return buf.slice(0)
        } else {
          var view = new Uint8Array(buf.byteLength);
          view.set(new Uint8Array(buf));
          return view.buffer
        }
      }

      function Body() {
        this.bodyUsed = false;

        this._initBody = function(body) {
          this._bodyInit = body;
          if (!body) {
            this._bodyText = '';
          } else if (typeof body === 'string') {
            this._bodyText = body;
          } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
            this._bodyBlob = body;
          } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
            this._bodyFormData = body;
          } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
            this._bodyText = body.toString();
          } else if (support.arrayBuffer && support.blob && isDataView(body)) {
            this._bodyArrayBuffer = bufferClone(body.buffer);
            // IE 10-11 can't handle a DataView body.
            this._bodyInit = new Blob([this._bodyArrayBuffer]);
          } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
            this._bodyArrayBuffer = bufferClone(body);
          } else {
            this._bodyText = body = Object.prototype.toString.call(body);
          }

          if (!this.headers.get('content-type')) {
            if (typeof body === 'string') {
              this.headers.set('content-type', 'text/plain;charset=UTF-8');
            } else if (this._bodyBlob && this._bodyBlob.type) {
              this.headers.set('content-type', this._bodyBlob.type);
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
            }
          }
        };

        if (support.blob) {
          this.blob = function() {
            var rejected = consumed(this);
            if (rejected) {
              return rejected
            }

            if (this._bodyBlob) {
              return Promise.resolve(this._bodyBlob)
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(new Blob([this._bodyArrayBuffer]))
            } else if (this._bodyFormData) {
              throw new Error('could not read FormData body as blob')
            } else {
              return Promise.resolve(new Blob([this._bodyText]))
            }
          };

          this.arrayBuffer = function() {
            if (this._bodyArrayBuffer) {
              return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
            } else {
              return this.blob().then(readBlobAsArrayBuffer)
            }
          };
        }

        this.text = function() {
          var rejected = consumed(this);
          if (rejected) {
            return rejected
          }

          if (this._bodyBlob) {
            return readBlobAsText(this._bodyBlob)
          } else if (this._bodyArrayBuffer) {
            return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
          } else if (this._bodyFormData) {
            throw new Error('could not read FormData body as text')
          } else {
            return Promise.resolve(this._bodyText)
          }
        };

        if (support.formData) {
          this.formData = function() {
            return this.text().then(decode)
          };
        }

        this.json = function() {
          return this.text().then(JSON.parse)
        };

        return this
      }

      // HTTP methods whose capitalization should be normalized
      var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

      function normalizeMethod(method) {
        var upcased = method.toUpperCase();
        return methods.indexOf(upcased) > -1 ? upcased : method
      }

      function Request(input, options) {
        options = options || {};
        var body = options.body;

        if (input instanceof Request) {
          if (input.bodyUsed) {
            throw new TypeError('Already read')
          }
          this.url = input.url;
          this.credentials = input.credentials;
          if (!options.headers) {
            this.headers = new Headers(input.headers);
          }
          this.method = input.method;
          this.mode = input.mode;
          this.signal = input.signal;
          if (!body && input._bodyInit != null) {
            body = input._bodyInit;
            input.bodyUsed = true;
          }
        } else {
          this.url = String(input);
        }

        this.credentials = options.credentials || this.credentials || 'same-origin';
        if (options.headers || !this.headers) {
          this.headers = new Headers(options.headers);
        }
        this.method = normalizeMethod(options.method || this.method || 'GET');
        this.mode = options.mode || this.mode || null;
        this.signal = options.signal || this.signal;
        this.referrer = null;

        if ((this.method === 'GET' || this.method === 'HEAD') && body) {
          throw new TypeError('Body not allowed for GET or HEAD requests')
        }
        this._initBody(body);
      }

      Request.prototype.clone = function() {
        return new Request(this, {body: this._bodyInit})
      };

      function decode(body) {
        var form = new FormData();
        body
          .trim()
          .split('&')
          .forEach(function(bytes) {
            if (bytes) {
              var split = bytes.split('=');
              var name = split.shift().replace(/\+/g, ' ');
              var value = split.join('=').replace(/\+/g, ' ');
              form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
          });
        return form
      }

      function parseHeaders(rawHeaders) {
        var headers = new Headers();
        // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
        // https://tools.ietf.org/html/rfc7230#section-3.2
        var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
        preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
          var parts = line.split(':');
          var key = parts.shift().trim();
          if (key) {
            var value = parts.join(':').trim();
            headers.append(key, value);
          }
        });
        return headers
      }

      Body.call(Request.prototype);

      function Response(bodyInit, options) {
        if (!options) {
          options = {};
        }

        this.type = 'default';
        this.status = options.status === undefined ? 200 : options.status;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = 'statusText' in options ? options.statusText : 'OK';
        this.headers = new Headers(options.headers);
        this.url = options.url || '';
        this._initBody(bodyInit);
      }

      Body.call(Response.prototype);

      Response.prototype.clone = function() {
        return new Response(this._bodyInit, {
          status: this.status,
          statusText: this.statusText,
          headers: new Headers(this.headers),
          url: this.url
        })
      };

      Response.error = function() {
        var response = new Response(null, {status: 0, statusText: ''});
        response.type = 'error';
        return response
      };

      var redirectStatuses = [301, 302, 303, 307, 308];

      Response.redirect = function(url, status) {
        if (redirectStatuses.indexOf(status) === -1) {
          throw new RangeError('Invalid status code')
        }

        return new Response(null, {status: status, headers: {location: url}})
      };

      exports.DOMException = self.DOMException;
      try {
        new exports.DOMException();
      } catch (err) {
        exports.DOMException = function(message, name) {
          this.message = message;
          this.name = name;
          var error = Error(message);
          this.stack = error.stack;
        };
        exports.DOMException.prototype = Object.create(Error.prototype);
        exports.DOMException.prototype.constructor = exports.DOMException;
      }

      function fetch(input, init) {
        return new Promise(function(resolve, reject) {
          var request = new Request(input, init);

          if (request.signal && request.signal.aborted) {
            return reject(new exports.DOMException('Aborted', 'AbortError'))
          }

          var xhr = new XMLHttpRequest();

          function abortXhr() {
            xhr.abort();
          }

          xhr.onload = function() {
            var options = {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: parseHeaders(xhr.getAllResponseHeaders() || '')
            };
            options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
            var body = 'response' in xhr ? xhr.response : xhr.responseText;
            resolve(new Response(body, options));
          };

          xhr.onerror = function() {
            reject(new TypeError('Network request failed'));
          };

          xhr.ontimeout = function() {
            reject(new TypeError('Network request failed'));
          };

          xhr.onabort = function() {
            reject(new exports.DOMException('Aborted', 'AbortError'));
          };

          xhr.open(request.method, request.url, true);

          if (request.credentials === 'include') {
            xhr.withCredentials = true;
          } else if (request.credentials === 'omit') {
            xhr.withCredentials = false;
          }

          if ('responseType' in xhr && support.blob) {
            xhr.responseType = 'blob';
          }

          request.headers.forEach(function(value, name) {
            xhr.setRequestHeader(name, value);
          });

          if (request.signal) {
            request.signal.addEventListener('abort', abortXhr);

            xhr.onreadystatechange = function() {
              // DONE (success or failure)
              if (xhr.readyState === 4) {
                request.signal.removeEventListener('abort', abortXhr);
              }
            };
          }

          xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
        })
      }

      fetch.polyfill = true;

      if (!self.fetch) {
        self.fetch = fetch;
        self.Headers = Headers;
        self.Request = Request;
        self.Response = Response;
      }

      exports.Headers = Headers;
      exports.Request = Request;
      exports.Response = Response;
      exports.fetch = fetch;

      Object.defineProperty(exports, '__esModule', { value: true });

      return exports;

    }({}));
    })(__self__);
    __self__.fetch.ponyfill = true;
    // Remove "polyfill" property added by whatwg-fetch
    delete __self__.fetch.polyfill;
    // Choose between native implementation (global) or custom implementation (__self__)
    // var ctx = global.fetch ? global : __self__;
    var ctx = __self__; // this line disable service worker support temporarily
    exports = ctx.fetch; // To enable: import fetch from 'cross-fetch'
    exports.default = ctx.fetch; // For TypeScript consumers without esModuleInterop.
    exports.fetch = ctx.fetch; // To enable: import {fetch} from 'cross-fetch'
    exports.Headers = ctx.Headers;
    exports.Request = ctx.Request;
    exports.Response = ctx.Response;
    module.exports = exports;
    });

    var fetch = unwrapExports(browserPonyfill);
    var browserPonyfill_1 = browserPonyfill.fetch;
    var browserPonyfill_2 = browserPonyfill.Headers;
    var browserPonyfill_3 = browserPonyfill.Request;
    var browserPonyfill_4 = browserPonyfill.Response;

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    const handleError = (error, reject) => {
        if (typeof error.json !== 'function') {
            return reject(error);
        }
        error.json().then((err) => {
            return reject({
                message: _getErrorMessage(err),
                status: (error === null || error === void 0 ? void 0 : error.status) || 500,
            });
        });
    };
    const _getRequestParams = (method, options, body) => {
        const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
        if (method === 'GET') {
            return params;
        }
        params.headers = Object.assign({ 'Content-Type': 'text/plain;charset=UTF-8' }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
        return params;
    };
    function _handleRequest(method, url, options, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fetch(url, _getRequestParams(method, options, body))
                    .then((result) => {
                    if (!result.ok)
                        throw result;
                    if (options === null || options === void 0 ? void 0 : options.noResolveJson)
                        return resolve;
                    return result.json();
                })
                    .then((data) => resolve(data))
                    .catch((error) => handleError(error, reject));
            });
        });
    }
    function get(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return _handleRequest('GET', url, options);
        });
    }
    function post(url, body, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return _handleRequest('POST', url, options, body);
        });
    }
    function put(url, body, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return _handleRequest('PUT', url, options, body);
        });
    }
    function remove(url, body, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return _handleRequest('DELETE', url, options, body);
        });
    }

    const GOTRUE_URL = 'http://localhost:9999';
    const DEFAULT_HEADERS$1 = {};
    const STORAGE_KEY = 'supabase.auth.token';
    const COOKIE_OPTIONS = {
        name: 'sb:token',
        lifetime: 60 * 60 * 8,
        domain: '',
        path: '/',
        sameSite: 'lax',
    };

    /**
     * Serialize data into a cookie header.
     */
    function serialize(name, val, options) {
        const opt = options || {};
        const enc = encodeURIComponent;
        const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        if (typeof enc !== 'function') {
            throw new TypeError('option encode is invalid');
        }
        if (!fieldContentRegExp.test(name)) {
            throw new TypeError('argument name is invalid');
        }
        const value = enc(val);
        if (value && !fieldContentRegExp.test(value)) {
            throw new TypeError('argument val is invalid');
        }
        let str = name + '=' + value;
        if (null != opt.maxAge) {
            const maxAge = opt.maxAge - 0;
            if (isNaN(maxAge) || !isFinite(maxAge)) {
                throw new TypeError('option maxAge is invalid');
            }
            str += '; Max-Age=' + Math.floor(maxAge);
        }
        if (opt.domain) {
            if (!fieldContentRegExp.test(opt.domain)) {
                throw new TypeError('option domain is invalid');
            }
            str += '; Domain=' + opt.domain;
        }
        if (opt.path) {
            if (!fieldContentRegExp.test(opt.path)) {
                throw new TypeError('option path is invalid');
            }
            str += '; Path=' + opt.path;
        }
        if (opt.expires) {
            if (typeof opt.expires.toUTCString !== 'function') {
                throw new TypeError('option expires is invalid');
            }
            str += '; Expires=' + opt.expires.toUTCString();
        }
        if (opt.httpOnly) {
            str += '; HttpOnly';
        }
        if (opt.secure) {
            str += '; Secure';
        }
        if (opt.sameSite) {
            const sameSite = typeof opt.sameSite === 'string' ? opt.sameSite.toLowerCase() : opt.sameSite;
            switch (sameSite) {
                case 'lax':
                    str += '; SameSite=Lax';
                    break;
                case 'strict':
                    str += '; SameSite=Strict';
                    break;
                case 'none':
                    str += '; SameSite=None';
                    break;
                default:
                    throw new TypeError('option sameSite is invalid');
            }
        }
        return str;
    }
    /**
     * Based on the environment and the request we know if a secure cookie can be set.
     */
    function isSecureEnvironment(req) {
        if (!req || !req.headers || !req.headers.host) {
            throw new Error('The "host" request header is not available');
        }
        const host = (req.headers.host.indexOf(':') > -1 && req.headers.host.split(':')[0]) || req.headers.host;
        if (['localhost', '127.0.0.1'].indexOf(host) > -1 || host.endsWith('.local')) {
            return false;
        }
        return true;
    }
    /**
     * Serialize a cookie to a string.
     */
    function serializeCookie(cookie, secure) {
        var _a, _b, _c;
        return serialize(cookie.name, cookie.value, {
            maxAge: cookie.maxAge,
            expires: new Date(Date.now() + cookie.maxAge * 1000),
            httpOnly: true,
            secure,
            path: (_a = cookie.path) !== null && _a !== void 0 ? _a : '/',
            domain: (_b = cookie.domain) !== null && _b !== void 0 ? _b : '',
            sameSite: (_c = cookie.sameSite) !== null && _c !== void 0 ? _c : 'lax',
        });
    }
    /**
     * Set one or more cookies.
     */
    function setCookies(req, res, cookies) {
        const strCookies = cookies.map((c) => serializeCookie(c, isSecureEnvironment(req)));
        const previousCookies = res.getHeader('Set-Cookie');
        if (previousCookies) {
            if (previousCookies instanceof Array) {
                Array.prototype.push.apply(strCookies, previousCookies);
            }
            else if (typeof previousCookies === 'string') {
                strCookies.push(previousCookies);
            }
        }
        res.setHeader('Set-Cookie', strCookies);
    }
    /**
     * Set one or more cookies.
     */
    function setCookie(req, res, cookie) {
        setCookies(req, res, [cookie]);
    }
    function deleteCookie(req, res, name) {
        setCookie(req, res, {
            name,
            value: '',
            maxAge: -1,
        });
    }

    function expiresAt(expiresIn) {
        const timeNow = Math.round(Date.now() / 1000);
        return timeNow + expiresIn;
    }
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (Math.random() * 16) | 0, v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    const isBrowser = () => typeof window !== 'undefined';
    function getParameterByName(name, url) {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&#]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    class LocalStorage {
        constructor(localStorage) {
            this.localStorage = localStorage || globalThis.localStorage;
        }
        clear() {
            return this.localStorage.clear();
        }
        key(index) {
            return this.localStorage.key(index);
        }
        setItem(key, value) {
            return this.localStorage.setItem(key, value);
        }
        getItem(key) {
            return this.localStorage.getItem(key);
        }
        removeItem(key) {
            return this.localStorage.removeItem(key);
        }
    }

    var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class GoTrueApi {
        constructor({ url = '', headers = {}, cookieOptions, }) {
            this.url = url;
            this.headers = headers;
            this.cookieOptions = Object.assign(Object.assign({}, COOKIE_OPTIONS), cookieOptions);
        }
        /**
         * Creates a new user using their email address.
         * @param email The email address of the user.
         * @param password The password of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         *
         * @returns A logged-in session if the server has "autoconfirm" ON
         * @returns A user if the server has "autoconfirm" OFF
         */
        signUpWithEmail(email, password, options = {}) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    let queryString = '';
                    if (options.redirectTo) {
                        queryString = '?redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post(`${this.url}/signup${queryString}`, { email, password }, { headers });
                    let session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Logs in an existing user using their email address.
         * @param email The email address of the user.
         * @param password The password of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        signInWithEmail(email, password, options = {}) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    let queryString = '?grant_type=password';
                    if (options.redirectTo) {
                        queryString += '&redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post(`${this.url}/token${queryString}`, { email, password }, { headers });
                    let session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Signs up a new user using their phone number and a password.
         * @param phone The email address of the user.
         * @param password The password of the user.
         */
        signUpWithPhone(phone, password) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    const data = yield post(`${this.url}/signup`, { phone, password }, { headers });
                    let session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Logs in an existing user using their phone number and password.
         * @param phone The email address of the user.
         * @param password The password of the user.
         */
        signInWithPhone(phone, password) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    let queryString = '?grant_type=password';
                    const data = yield post(`${this.url}/token${queryString}`, { phone, password }, { headers });
                    let session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Sends a magic login link to an email address.
         * @param email The email address of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        sendMagicLinkEmail(email, options = {}) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    let queryString = '';
                    if (options.redirectTo) {
                        queryString += '?redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post(`${this.url}/magiclink${queryString}`, { email }, { headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Sends a mobile OTP via SMS. Will register the account if it doesn't already exist
         * @param phone The user's phone number WITH international prefix
         */
        sendMobileOTP(phone) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    const data = yield post(`${this.url}/otp`, { phone }, { headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Send User supplied Mobile OTP to be verified
         * @param phone The user's phone number WITH international prefix
         * @param token token that user was sent to their mobile phone
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        verifyMobileOTP(phone, token, options = {}) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    const data = yield post(`${this.url}/verify`, { phone, token, type: 'sms', redirect_to: options.redirectTo }, { headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Sends an invite link to an email address.
         * @param email The email address of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        inviteUserByEmail(email, options = {}) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    let queryString = '';
                    if (options.redirectTo) {
                        queryString += '?redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post(`${this.url}/invite${queryString}`, { email }, { headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Sends a reset request to an email address.
         * @param email The email address of the user.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        resetPasswordForEmail(email, options = {}) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    let headers = Object.assign({}, this.headers);
                    let queryString = '';
                    if (options.redirectTo) {
                        queryString += '?redirect_to=' + encodeURIComponent(options.redirectTo);
                    }
                    const data = yield post(`${this.url}/recover${queryString}`, { email }, { headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Create a temporary object with all configured headers and
         * adds the Authorization token to be used on request methods
         * @param jwt A valid, logged-in JWT.
         */
        _createRequestHeaders(jwt) {
            const headers = Object.assign({}, this.headers);
            headers['Authorization'] = `Bearer ${jwt}`;
            return headers;
        }
        /**
         * Removes a logged-in session.
         * @param jwt A valid, logged-in JWT.
         */
        signOut(jwt) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    yield post(`${this.url}/logout`, {}, { headers: this._createRequestHeaders(jwt), noResolveJson: true });
                    return { error: null };
                }
                catch (error) {
                    return { error };
                }
            });
        }
        /**
         * Generates the relevant login URL for a third-party provider.
         * @param provider One of the providers supported by GoTrue.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         * @param scopes A space-separated list of scopes granted to the OAuth application.
         */
        getUrlForProvider(provider, options) {
            let urlParams = [`provider=${encodeURIComponent(provider)}`];
            if (options === null || options === void 0 ? void 0 : options.redirectTo) {
                urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
            }
            if (options === null || options === void 0 ? void 0 : options.scopes) {
                urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
            }
            return `${this.url}/authorize?${urlParams.join('&')}`;
        }
        /**
         * Gets the user details.
         * @param jwt A valid, logged-in JWT.
         */
        getUser(jwt) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const data = yield get(`${this.url}/user`, { headers: this._createRequestHeaders(jwt) });
                    return { user: data, data, error: null };
                }
                catch (error) {
                    return { user: null, data: null, error };
                }
            });
        }
        /**
         * Updates the user data.
         * @param jwt A valid, logged-in JWT.
         * @param attributes The data you want to update.
         */
        updateUser(jwt, attributes) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const data = yield put(`${this.url}/user`, attributes, {
                        headers: this._createRequestHeaders(jwt),
                    });
                    return { user: data, data, error: null };
                }
                catch (error) {
                    return { user: null, data: null, error };
                }
            });
        }
        /**
         * Delete an user.
         * @param uid The user uid you want to remove.
         * @param jwt A valid JWT. Must be a full-access API key (e.g. service_role key).
         */
        deleteUser(uid, jwt) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const data = yield remove(`${this.url}/admin/users/${uid}`, {}, {
                        headers: this._createRequestHeaders(jwt),
                    });
                    return { user: data, data, error: null };
                }
                catch (error) {
                    return { user: null, data: null, error };
                }
            });
        }
        /**
         * Generates a new JWT.
         * @param refreshToken A valid refresh token that was returned on login.
         */
        refreshAccessToken(refreshToken) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const data = yield post(`${this.url}/token?grant_type=refresh_token`, { refresh_token: refreshToken }, { headers: this.headers });
                    let session = Object.assign({}, data);
                    if (session.expires_in)
                        session.expires_at = expiresAt(data.expires_in);
                    return { data: session, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Set/delete the auth cookie based on the AuthChangeEvent.
         * Works for Next.js & Express (requires cookie-parser middleware).
         */
        setAuthCookie(req, res) {
            if (req.method !== 'POST') {
                res.setHeader('Allow', 'POST');
                res.status(405).end('Method Not Allowed');
            }
            const { event, session } = req.body;
            if (!event)
                throw new Error('Auth event missing!');
            if (event === 'SIGNED_IN') {
                if (!session)
                    throw new Error('Auth session missing!');
                setCookie(req, res, {
                    name: this.cookieOptions.name,
                    value: session.access_token,
                    domain: this.cookieOptions.domain,
                    maxAge: this.cookieOptions.lifetime,
                    path: this.cookieOptions.path,
                    sameSite: this.cookieOptions.sameSite,
                });
            }
            if (event === 'SIGNED_OUT')
                deleteCookie(req, res, this.cookieOptions.name);
            res.status(200).json({});
        }
        /**
         * Get user by reading the cookie from the request.
         * Works for Next.js & Express (requires cookie-parser middleware).
         */
        getUserByCookie(req) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    if (!req.cookies)
                        throw new Error('Not able to parse cookies! When using Express make sure the cookie-parser middleware is in use!');
                    if (!req.cookies[this.cookieOptions.name])
                        throw new Error('No cookie found!');
                    const token = req.cookies[this.cookieOptions.name];
                    const { user, error } = yield this.getUser(token);
                    if (error)
                        throw error;
                    return { user, data: user, error: null };
                }
                catch (error) {
                    return { user: null, data: null, error };
                }
            });
        }
        /**
         * Generates links to be sent via email or other.
         * @param type The link type ("signup" or "magiclink" or "recovery" or "invite").
         * @param email The user's email.
         * @param password User password. For signup only.
         * @param data Optional user metadata. For signup only.
         * @param redirectTo The link type ("signup" or "magiclink" or "recovery" or "invite").
         */
        generateLink(type, email, options = {}) {
            return __awaiter$1(this, void 0, void 0, function* () {
                try {
                    const data = yield post(`${this.url}/admin/generate_link`, {
                        type,
                        email,
                        password: options.password,
                        data: options.data,
                        redirect_to: options.redirectTo,
                    }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
    }

    // @ts-nocheck
    /**
     * https://mathiasbynens.be/notes/globalthis
     */
    function polyfillGlobalThis() {
        if (typeof globalThis === 'object')
            return;
        try {
            Object.defineProperty(Object.prototype, '__magic__', {
                get: function () {
                    return this;
                },
                configurable: true,
            });
            __magic__.globalThis = __magic__;
            delete Object.prototype.__magic__;
        }
        catch (e) {
            if (typeof self !== 'undefined') {
                self.globalThis = self;
            }
        }
    }

    var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    polyfillGlobalThis(); // Make "globalThis" available
    const DEFAULT_OPTIONS = {
        url: GOTRUE_URL,
        autoRefreshToken: true,
        persistSession: true,
        localStorage: globalThis.localStorage,
        detectSessionInUrl: true,
        headers: DEFAULT_HEADERS$1,
    };
    class GoTrueClient {
        /**
         * Create a new client for use in the browser.
         * @param options.url The URL of the GoTrue server.
         * @param options.headers Any additional headers to send to the GoTrue server.
         * @param options.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
         * @param options.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
         * @param options.persistSession Set to "true" if you want to automatically save the user session into local storage.
         * @param options.localStorage
         */
        constructor(options) {
            this.stateChangeEmitters = new Map();
            const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
            this.currentUser = null;
            this.currentSession = null;
            this.autoRefreshToken = settings.autoRefreshToken;
            this.persistSession = settings.persistSession;
            this.localStorage = new LocalStorage(settings.localStorage);
            this.api = new GoTrueApi({
                url: settings.url,
                headers: settings.headers,
                cookieOptions: settings.cookieOptions,
            });
            this._recoverSession();
            this._recoverAndRefresh();
            // Handle the OAuth redirect
            try {
                if (settings.detectSessionInUrl && isBrowser() && !!getParameterByName('access_token')) {
                    this.getSessionFromUrl({ storeSession: true });
                }
            }
            catch (error) {
                console.log('Error getting session from URL.');
            }
        }
        /**
         * Creates a new user.
         * @type UserCredentials
         * @param email The user's email address.
         * @param password The user's password.
         * @param phone The user's phone number.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        signUp({ email, password, phone }, options = {}) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    this._removeSession();
                    const { data, error } = phone && password
                        ? yield this.api.signUpWithPhone(phone, password)
                        : yield this.api.signUpWithEmail(email, password, {
                            redirectTo: options.redirectTo,
                        });
                    if (error) {
                        throw error;
                    }
                    if (!data) {
                        throw 'An error occurred on sign up.';
                    }
                    let session = null;
                    let user = null;
                    if (data.access_token) {
                        session = data;
                        user = session.user;
                        this._saveSession(session);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                    if (data.id) {
                        user = data;
                    }
                    return { data, user, session, error: null };
                }
                catch (error) {
                    return { data: null, user: null, session: null, error };
                }
            });
        }
        /**
         * Log in an existing user, or login via a third-party provider.
         * @type UserCredentials
         * @param email The user's email address.
         * @param password The user's password.
         * @param refreshToken A valid refresh token that was returned on login.
         * @param provider One of the providers supported by GoTrue.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         * @param scopes A space-separated list of scopes granted to the OAuth application.
         */
        signIn({ email, phone, password, refreshToken, provider }, options = {}) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    this._removeSession();
                    if (email && !password) {
                        const { error } = yield this.api.sendMagicLinkEmail(email, {
                            redirectTo: options.redirectTo,
                        });
                        return { data: null, user: null, session: null, error };
                    }
                    if (email && password) {
                        return this._handleEmailSignIn(email, password, {
                            redirectTo: options.redirectTo,
                        });
                    }
                    if (phone && !password) {
                        const { error } = yield this.api.sendMobileOTP(phone);
                        return { data: null, user: null, session: null, error };
                    }
                    if (phone && password) {
                        return this._handlePhoneSignIn(phone, password);
                    }
                    if (refreshToken) {
                        // currentSession and currentUser will be updated to latest on _callRefreshToken using the passed refreshToken
                        const { error } = yield this._callRefreshToken(refreshToken);
                        if (error)
                            throw error;
                        return {
                            data: this.currentSession,
                            user: this.currentUser,
                            session: this.currentSession,
                            error: null,
                        };
                    }
                    if (provider) {
                        return this._handleProviderSignIn(provider, {
                            redirectTo: options.redirectTo,
                            scopes: options.scopes,
                        });
                    }
                    throw new Error(`You must provide either an email, phone number or a third-party provider.`);
                }
                catch (error) {
                    return { data: null, user: null, session: null, error };
                }
            });
        }
        /**
         * Log in a user given a User supplied OTP received via mobile.
         * @param phone The user's phone number.
         * @param token The user's password.
         * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
         */
        verifyOTP({ phone, token }, options = {}) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    this._removeSession();
                    const { data, error } = yield this.api.verifyMobileOTP(phone, token, options);
                    if (error) {
                        throw error;
                    }
                    if (!data) {
                        throw 'An error occurred on token verification.';
                    }
                    let session = null;
                    let user = null;
                    if (data.access_token) {
                        session = data;
                        user = session.user;
                        this._saveSession(session);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                    if (data.id) {
                        user = data;
                    }
                    return { data, user, session, error: null };
                }
                catch (error) {
                    return { data: null, user: null, session: null, error };
                }
            });
        }
        /**
         * Inside a browser context, `user()` will return the user data, if there is a logged in user.
         *
         * For server-side management, you can get a user through `auth.api.getUserByCookie()`
         */
        user() {
            return this.currentUser;
        }
        /**
         * Returns the session data, if there is an active session.
         */
        session() {
            return this.currentSession;
        }
        /**
         * Force refreshes the session including the user data in case it was updated in a different session.
         */
        refreshSession() {
            var _a;
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    if (!((_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.access_token))
                        throw new Error('Not logged in.');
                    // currentSession and currentUser will be updated to latest on _callRefreshToken
                    const { error } = yield this._callRefreshToken();
                    if (error)
                        throw error;
                    return { data: this.currentSession, user: this.currentUser, error: null };
                }
                catch (error) {
                    return { data: null, user: null, error };
                }
            });
        }
        /**
         * Updates user data, if there is a logged in user.
         */
        update(attributes) {
            var _a;
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    if (!((_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.access_token))
                        throw new Error('Not logged in.');
                    const { user, error } = yield this.api.updateUser(this.currentSession.access_token, attributes);
                    if (error)
                        throw error;
                    if (!user)
                        throw Error('Invalid user data.');
                    const session = Object.assign(Object.assign({}, this.currentSession), { user });
                    this._saveSession(session);
                    this._notifyAllSubscribers('USER_UPDATED');
                    return { data: user, user, error: null };
                }
                catch (error) {
                    return { data: null, user: null, error };
                }
            });
        }
        /**
         * Sets the session data from refresh_token and returns current Session and Error
         * @param refresh_token a JWT token
         */
        setSession(refresh_token) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    if (!refresh_token) {
                        throw new Error('No current session.');
                    }
                    const { data, error } = yield this.api.refreshAccessToken(refresh_token);
                    if (error) {
                        return { session: null, error: error };
                    }
                    if (!data) {
                        return {
                            session: null,
                            error: { name: 'Invalid refresh_token', message: 'JWT token provided is Invalid' },
                        };
                    }
                    this._saveSession(data);
                    this._notifyAllSubscribers('SIGNED_IN');
                    return { session: data, error: null };
                }
                catch (error) {
                    return { error, session: null };
                }
            });
        }
        /**
         * Overrides the JWT on the current client. The JWT will then be sent in all subsequent network requests.
         * @param access_token a jwt access token
         */
        setAuth(access_token) {
            this.currentSession = Object.assign(Object.assign({}, this.currentSession), { access_token, token_type: 'bearer', user: null });
            return this.currentSession;
        }
        /**
         * Gets the session data from a URL string
         * @param options.storeSession Optionally store the session in the browser
         */
        getSessionFromUrl(options) {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    if (!isBrowser())
                        throw new Error('No browser detected.');
                    const error_description = getParameterByName('error_description');
                    if (error_description)
                        throw new Error(error_description);
                    const provider_token = getParameterByName('provider_token');
                    const access_token = getParameterByName('access_token');
                    if (!access_token)
                        throw new Error('No access_token detected.');
                    const expires_in = getParameterByName('expires_in');
                    if (!expires_in)
                        throw new Error('No expires_in detected.');
                    const refresh_token = getParameterByName('refresh_token');
                    if (!refresh_token)
                        throw new Error('No refresh_token detected.');
                    const token_type = getParameterByName('token_type');
                    if (!token_type)
                        throw new Error('No token_type detected.');
                    const timeNow = Math.round(Date.now() / 1000);
                    const expires_at = timeNow + parseInt(expires_in);
                    const { user, error } = yield this.api.getUser(access_token);
                    if (error)
                        throw error;
                    const session = {
                        provider_token,
                        access_token,
                        expires_in: parseInt(expires_in),
                        expires_at,
                        refresh_token,
                        token_type,
                        user: user,
                    };
                    if (options === null || options === void 0 ? void 0 : options.storeSession) {
                        this._saveSession(session);
                        this._notifyAllSubscribers('SIGNED_IN');
                        if (getParameterByName('type') === 'recovery') {
                            this._notifyAllSubscribers('PASSWORD_RECOVERY');
                        }
                    }
                    // Remove tokens from URL
                    window.location.hash = '';
                    return { data: session, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Inside a browser context, `signOut()` will remove extract the logged in user from the browser session
         * and log them out - removing all items from localstorage and then trigger a "SIGNED_OUT" event.
         *
         * For server-side management, you can disable sessions by passing a JWT through to `auth.api.signOut(JWT: string)`
         */
        signOut() {
            var _a;
            return __awaiter$2(this, void 0, void 0, function* () {
                const accessToken = (_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.access_token;
                this._removeSession();
                this._notifyAllSubscribers('SIGNED_OUT');
                if (accessToken) {
                    const { error } = yield this.api.signOut(accessToken);
                    if (error)
                        return { error };
                }
                return { error: null };
            });
        }
        /**
         * Receive a notification every time an auth event happens.
         * @returns {Subscription} A subscription object which can be used to unsubscribe itself.
         */
        onAuthStateChange(callback) {
            try {
                const id = uuid();
                const self = this;
                const subscription = {
                    id,
                    callback,
                    unsubscribe: () => {
                        self.stateChangeEmitters.delete(id);
                    },
                };
                this.stateChangeEmitters.set(id, subscription);
                return { data: subscription, error: null };
            }
            catch (error) {
                return { data: null, error };
            }
        }
        _handleEmailSignIn(email, password, options = {}) {
            var _a, _b;
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const { data, error } = yield this.api.signInWithEmail(email, password, {
                        redirectTo: options.redirectTo,
                    });
                    if (error || !data)
                        return { data: null, user: null, session: null, error };
                    if (((_a = data === null || data === void 0 ? void 0 : data.user) === null || _a === void 0 ? void 0 : _a.confirmed_at) || ((_b = data === null || data === void 0 ? void 0 : data.user) === null || _b === void 0 ? void 0 : _b.email_confirmed_at)) {
                        this._saveSession(data);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                    return { data, user: data.user, session: data, error: null };
                }
                catch (error) {
                    return { data: null, user: null, session: null, error };
                }
            });
        }
        _handlePhoneSignIn(phone, password) {
            var _a;
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const { data, error } = yield this.api.signInWithPhone(phone, password);
                    if (error || !data)
                        return { data: null, user: null, session: null, error };
                    if ((_a = data === null || data === void 0 ? void 0 : data.user) === null || _a === void 0 ? void 0 : _a.phone_confirmed_at) {
                        this._saveSession(data);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                    return { data, user: data.user, session: data, error: null };
                }
                catch (error) {
                    return { data: null, user: null, session: null, error };
                }
            });
        }
        _handleProviderSignIn(provider, options = {}) {
            const url = this.api.getUrlForProvider(provider, {
                redirectTo: options.redirectTo,
                scopes: options.scopes,
            });
            try {
                // try to open on the browser
                if (isBrowser()) {
                    window.location.href = url;
                }
                return { provider, url, data: null, session: null, user: null, error: null };
            }
            catch (error) {
                // fallback to returning the URL
                if (!!url)
                    return { provider, url, data: null, session: null, user: null, error: null };
                return { data: null, user: null, session: null, error };
            }
        }
        /**
         * Attempts to get the session from LocalStorage
         * Note: this should never be async (even for React Native), as we need it to return immediately in the constructor.
         */
        _recoverSession() {
            var _a;
            try {
                const json = isBrowser() && ((_a = this.localStorage) === null || _a === void 0 ? void 0 : _a.getItem(STORAGE_KEY));
                if (!json || typeof json !== 'string') {
                    return null;
                }
                const data = JSON.parse(json);
                const { currentSession, expiresAt } = data;
                const timeNow = Math.round(Date.now() / 1000);
                if (expiresAt >= timeNow && (currentSession === null || currentSession === void 0 ? void 0 : currentSession.user)) {
                    this._saveSession(currentSession);
                    this._notifyAllSubscribers('SIGNED_IN');
                }
            }
            catch (error) {
                console.log('error', error);
            }
        }
        /**
         * Recovers the session from LocalStorage and refreshes
         * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
         */
        _recoverAndRefresh() {
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    const json = isBrowser() && (yield this.localStorage.getItem(STORAGE_KEY));
                    if (!json) {
                        return null;
                    }
                    const data = JSON.parse(json);
                    const { currentSession, expiresAt } = data;
                    const timeNow = Math.round(Date.now() / 1000);
                    if (expiresAt < timeNow) {
                        if (this.autoRefreshToken && currentSession.refresh_token) {
                            const { error } = yield this._callRefreshToken(currentSession.refresh_token);
                            if (error) {
                                console.log(error.message);
                                yield this._removeSession();
                            }
                        }
                        else {
                            this._removeSession();
                        }
                    }
                    else if (!currentSession || !currentSession.user) {
                        console.log('Current session is missing data.');
                        this._removeSession();
                    }
                    else {
                        // should be handled on _recoverSession method already
                        // But we still need the code here to accommodate for AsyncStorage e.g. in React native
                        this._saveSession(currentSession);
                        this._notifyAllSubscribers('SIGNED_IN');
                    }
                }
                catch (err) {
                    console.error(err);
                    return null;
                }
            });
        }
        _callRefreshToken(refresh_token) {
            var _a;
            if (refresh_token === void 0) { refresh_token = (_a = this.currentSession) === null || _a === void 0 ? void 0 : _a.refresh_token; }
            return __awaiter$2(this, void 0, void 0, function* () {
                try {
                    if (!refresh_token) {
                        throw new Error('No current session.');
                    }
                    const { data, error } = yield this.api.refreshAccessToken(refresh_token);
                    if (error)
                        throw error;
                    if (!data)
                        throw Error('Invalid session data.');
                    this._saveSession(data);
                    this._notifyAllSubscribers('SIGNED_IN');
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        _notifyAllSubscribers(event) {
            this.stateChangeEmitters.forEach((x) => x.callback(event, this.currentSession));
        }
        /**
         * set currentSession and currentUser
         * process to _startAutoRefreshToken if possible
         */
        _saveSession(session) {
            this.currentSession = session;
            this.currentUser = session.user;
            const expiresAt = session.expires_at;
            if (expiresAt) {
                const timeNow = Math.round(Date.now() / 1000);
                const expiresIn = expiresAt - timeNow;
                const refreshDurationBeforeExpires = expiresIn > 60 ? 60 : 0.5;
                this._startAutoRefreshToken((expiresIn - refreshDurationBeforeExpires) * 1000);
            }
            // Do we need any extra check before persist session
            // access_token or user ?
            if (this.persistSession && session.expires_at) {
                this._persistSession(this.currentSession);
            }
        }
        _persistSession(currentSession) {
            const data = { currentSession, expiresAt: currentSession.expires_at };
            isBrowser() && this.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
        _removeSession() {
            return __awaiter$2(this, void 0, void 0, function* () {
                this.currentSession = null;
                this.currentUser = null;
                if (this.refreshTokenTimer)
                    clearTimeout(this.refreshTokenTimer);
                isBrowser() && (yield this.localStorage.removeItem(STORAGE_KEY));
            });
        }
        /**
         * Clear and re-create refresh token timer
         * @param value time intervals in milliseconds
         */
        _startAutoRefreshToken(value) {
            if (this.refreshTokenTimer)
                clearTimeout(this.refreshTokenTimer);
            if (value <= 0 || !this.autoRefreshToken)
                return;
            this.refreshTokenTimer = setTimeout(() => this._callRefreshToken(), value);
            if (typeof this.refreshTokenTimer.unref === 'function')
                this.refreshTokenTimer.unref();
        }
    }

    class SupabaseAuthClient extends GoTrueClient {
        constructor(options) {
            super(options);
        }
    }

    var __awaiter$3 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class PostgrestBuilder {
        constructor(builder) {
            Object.assign(this, builder);
        }
        /**
         * If there's an error with the query, throwOnError will reject the promise by
         * throwing the error instead of returning it as part of a successful response.
         *
         * {@link https://github.com/supabase/supabase-js/issues/92}
         */
        throwOnError() {
            this.shouldThrowOnError = true;
            return this;
        }
        then(onfulfilled, onrejected) {
            // https://postgrest.org/en/stable/api.html#switching-schemas
            if (typeof this.schema === 'undefined') ;
            else if (['GET', 'HEAD'].includes(this.method)) {
                this.headers['Accept-Profile'] = this.schema;
            }
            else {
                this.headers['Content-Profile'] = this.schema;
            }
            if (this.method !== 'GET' && this.method !== 'HEAD') {
                this.headers['Content-Type'] = 'application/json';
            }
            return fetch(this.url.toString(), {
                method: this.method,
                headers: this.headers,
                body: JSON.stringify(this.body),
            })
                .then((res) => __awaiter$3(this, void 0, void 0, function* () {
                var _a, _b, _c;
                let error = null;
                let data = null;
                let count = null;
                if (res.ok) {
                    const isReturnMinimal = (_a = this.headers['Prefer']) === null || _a === void 0 ? void 0 : _a.split(',').includes('return=minimal');
                    if (this.method !== 'HEAD' && !isReturnMinimal) {
                        const text = yield res.text();
                        if (!text) ;
                        else if (this.headers['Accept'] === 'text/csv') {
                            data = text;
                        }
                        else {
                            data = JSON.parse(text);
                        }
                    }
                    const countHeader = (_b = this.headers['Prefer']) === null || _b === void 0 ? void 0 : _b.match(/count=(exact|planned|estimated)/);
                    const contentRange = (_c = res.headers.get('content-range')) === null || _c === void 0 ? void 0 : _c.split('/');
                    if (countHeader && contentRange && contentRange.length > 1) {
                        count = parseInt(contentRange[1]);
                    }
                }
                else {
                    error = yield res.json();
                    if (error && this.shouldThrowOnError) {
                        throw error;
                    }
                }
                const postgrestResponse = {
                    error,
                    data,
                    count,
                    status: res.status,
                    statusText: res.statusText,
                    body: data,
                };
                return postgrestResponse;
            }))
                .then(onfulfilled, onrejected);
        }
    }

    /**
     * Post-filters (transforms)
     */
    class PostgrestTransformBuilder extends PostgrestBuilder {
        /**
         * Performs vertical filtering with SELECT.
         *
         * @param columns  The columns to retrieve, separated by commas.
         */
        select(columns = '*') {
            // Remove whitespaces except when quoted
            let quoted = false;
            const cleanedColumns = columns
                .split('')
                .map((c) => {
                if (/\s/.test(c) && !quoted) {
                    return '';
                }
                if (c === '"') {
                    quoted = !quoted;
                }
                return c;
            })
                .join('');
            this.url.searchParams.set('select', cleanedColumns);
            return this;
        }
        /**
         * Orders the result with the specified `column`.
         *
         * @param column  The column to order on.
         * @param ascending  If `true`, the result will be in ascending order.
         * @param nullsFirst  If `true`, `null`s appear first.
         * @param foreignTable  The foreign table to use (if `column` is a foreign column).
         */
        order(column, { ascending = true, nullsFirst = false, foreignTable, } = {}) {
            const key = typeof foreignTable === 'undefined' ? 'order' : `${foreignTable}.order`;
            const existingOrder = this.url.searchParams.get(key);
            this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ''}${column}.${ascending ? 'asc' : 'desc'}.${nullsFirst ? 'nullsfirst' : 'nullslast'}`);
            return this;
        }
        /**
         * Limits the result with the specified `count`.
         *
         * @param count  The maximum no. of rows to limit to.
         * @param foreignTable  The foreign table to use (for foreign columns).
         */
        limit(count, { foreignTable } = {}) {
            const key = typeof foreignTable === 'undefined' ? 'limit' : `${foreignTable}.limit`;
            this.url.searchParams.set(key, `${count}`);
            return this;
        }
        /**
         * Limits the result to rows within the specified range, inclusive.
         *
         * @param from  The starting index from which to limit the result, inclusive.
         * @param to  The last index to which to limit the result, inclusive.
         * @param foreignTable  The foreign table to use (for foreign columns).
         */
        range(from, to, { foreignTable } = {}) {
            const keyOffset = typeof foreignTable === 'undefined' ? 'offset' : `${foreignTable}.offset`;
            const keyLimit = typeof foreignTable === 'undefined' ? 'limit' : `${foreignTable}.limit`;
            this.url.searchParams.set(keyOffset, `${from}`);
            // Range is inclusive, so add 1
            this.url.searchParams.set(keyLimit, `${to - from + 1}`);
            return this;
        }
        /**
         * Retrieves only one row from the result. Result must be one row (e.g. using
         * `limit`), otherwise this will result in an error.
         */
        single() {
            this.headers['Accept'] = 'application/vnd.pgrst.object+json';
            return this;
        }
        /**
         * Retrieves at most one row from the result. Result must be at most one row
         * (e.g. using `eq` on a UNIQUE column), otherwise this will result in an
         * error.
         */
        maybeSingle() {
            this.headers['Accept'] = 'application/vnd.pgrst.object+json';
            const _this = new PostgrestTransformBuilder(this);
            _this.then = ((onfulfilled, onrejected) => this.then((res) => {
                var _a, _b;
                if ((_b = (_a = res.error) === null || _a === void 0 ? void 0 : _a.details) === null || _b === void 0 ? void 0 : _b.includes('Results contain 0 rows')) {
                    return onfulfilled({
                        error: null,
                        data: null,
                        count: res.count,
                        status: 200,
                        statusText: 'OK',
                        body: null,
                    });
                }
                return onfulfilled(res);
            }, onrejected));
            return _this;
        }
        /**
         * Set the response type to CSV.
         */
        csv() {
            this.headers['Accept'] = 'text/csv';
            return this;
        }
    }

    class PostgrestFilterBuilder extends PostgrestTransformBuilder {
        constructor() {
            super(...arguments);
            /** @deprecated Use `contains()` instead. */
            this.cs = this.contains;
            /** @deprecated Use `containedBy()` instead. */
            this.cd = this.containedBy;
            /** @deprecated Use `rangeLt()` instead. */
            this.sl = this.rangeLt;
            /** @deprecated Use `rangeGt()` instead. */
            this.sr = this.rangeGt;
            /** @deprecated Use `rangeGte()` instead. */
            this.nxl = this.rangeGte;
            /** @deprecated Use `rangeLte()` instead. */
            this.nxr = this.rangeLte;
            /** @deprecated Use `rangeAdjacent()` instead. */
            this.adj = this.rangeAdjacent;
            /** @deprecated Use `overlaps()` instead. */
            this.ov = this.overlaps;
        }
        /**
         * Finds all rows which doesn't satisfy the filter.
         *
         * @param column  The column to filter on.
         * @param operator  The operator to filter with.
         * @param value  The value to filter with.
         */
        not(column, operator, value) {
            this.url.searchParams.append(`${column}`, `not.${operator}.${value}`);
            return this;
        }
        /**
         * Finds all rows satisfying at least one of the filters.
         *
         * @param filters  The filters to use, separated by commas.
         * @param foreignTable  The foreign table to use (if `column` is a foreign column).
         */
        or(filters, { foreignTable } = {}) {
            const key = typeof foreignTable === 'undefined' ? 'or' : `${foreignTable}.or`;
            this.url.searchParams.append(key, `(${filters})`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` exactly matches the
         * specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        eq(column, value) {
            this.url.searchParams.append(`${column}`, `eq.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` doesn't match the
         * specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        neq(column, value) {
            this.url.searchParams.append(`${column}`, `neq.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is greater than the
         * specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        gt(column, value) {
            this.url.searchParams.append(`${column}`, `gt.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is greater than or
         * equal to the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        gte(column, value) {
            this.url.searchParams.append(`${column}`, `gte.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is less than the
         * specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        lt(column, value) {
            this.url.searchParams.append(`${column}`, `lt.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is less than or equal
         * to the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        lte(column, value) {
            this.url.searchParams.append(`${column}`, `lte.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value in the stated `column` matches the supplied
         * `pattern` (case sensitive).
         *
         * @param column  The column to filter on.
         * @param pattern  The pattern to filter with.
         */
        like(column, pattern) {
            this.url.searchParams.append(`${column}`, `like.${pattern}`);
            return this;
        }
        /**
         * Finds all rows whose value in the stated `column` matches the supplied
         * `pattern` (case insensitive).
         *
         * @param column  The column to filter on.
         * @param pattern  The pattern to filter with.
         */
        ilike(column, pattern) {
            this.url.searchParams.append(`${column}`, `ilike.${pattern}`);
            return this;
        }
        /**
         * A check for exact equality (null, true, false), finds all rows whose
         * value on the stated `column` exactly match the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        is(column, value) {
            this.url.searchParams.append(`${column}`, `is.${value}`);
            return this;
        }
        /**
         * Finds all rows whose value on the stated `column` is found on the
         * specified `values`.
         *
         * @param column  The column to filter on.
         * @param values  The values to filter with.
         */
        in(column, values) {
            const cleanedValues = values
                .map((s) => {
                // handle postgrest reserved characters
                // https://postgrest.org/en/v7.0.0/api.html#reserved-characters
                if (typeof s === 'string' && new RegExp('[,()]').test(s))
                    return `"${s}"`;
                else
                    return `${s}`;
            })
                .join(',');
            this.url.searchParams.append(`${column}`, `in.(${cleanedValues})`);
            return this;
        }
        /**
         * Finds all rows whose json, array, or range value on the stated `column`
         * contains the values specified in `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        contains(column, value) {
            if (typeof value === 'string') {
                // range types can be inclusive '[', ']' or exclusive '(', ')' so just
                // keep it simple and accept a string
                this.url.searchParams.append(`${column}`, `cs.${value}`);
            }
            else if (Array.isArray(value)) {
                // array
                this.url.searchParams.append(`${column}`, `cs.{${value.join(',')}}`);
            }
            else {
                // json
                this.url.searchParams.append(`${column}`, `cs.${JSON.stringify(value)}`);
            }
            return this;
        }
        /**
         * Finds all rows whose json, array, or range value on the stated `column` is
         * contained by the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        containedBy(column, value) {
            if (typeof value === 'string') {
                // range
                this.url.searchParams.append(`${column}`, `cd.${value}`);
            }
            else if (Array.isArray(value)) {
                // array
                this.url.searchParams.append(`${column}`, `cd.{${value.join(',')}}`);
            }
            else {
                // json
                this.url.searchParams.append(`${column}`, `cd.${JSON.stringify(value)}`);
            }
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` is strictly to the
         * left of the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeLt(column, range) {
            this.url.searchParams.append(`${column}`, `sl.${range}`);
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` is strictly to
         * the right of the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeGt(column, range) {
            this.url.searchParams.append(`${column}`, `sr.${range}`);
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` does not extend
         * to the left of the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeGte(column, range) {
            this.url.searchParams.append(`${column}`, `nxl.${range}`);
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` does not extend
         * to the right of the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeLte(column, range) {
            this.url.searchParams.append(`${column}`, `nxr.${range}`);
            return this;
        }
        /**
         * Finds all rows whose range value on the stated `column` is adjacent to
         * the specified `range`.
         *
         * @param column  The column to filter on.
         * @param range  The range to filter with.
         */
        rangeAdjacent(column, range) {
            this.url.searchParams.append(`${column}`, `adj.${range}`);
            return this;
        }
        /**
         * Finds all rows whose array or range value on the stated `column` overlaps
         * (has a value in common) with the specified `value`.
         *
         * @param column  The column to filter on.
         * @param value  The value to filter with.
         */
        overlaps(column, value) {
            if (typeof value === 'string') {
                // range
                this.url.searchParams.append(`${column}`, `ov.${value}`);
            }
            else {
                // array
                this.url.searchParams.append(`${column}`, `ov.{${value.join(',')}}`);
            }
            return this;
        }
        /**
         * Finds all rows whose text or tsvector value on the stated `column` matches
         * the tsquery in `query`.
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         * @param type  The type of tsquery conversion to use on `query`.
         */
        textSearch(column, query, { config, type = null, } = {}) {
            let typePart = '';
            if (type === 'plain') {
                typePart = 'pl';
            }
            else if (type === 'phrase') {
                typePart = 'ph';
            }
            else if (type === 'websearch') {
                typePart = 'w';
            }
            const configPart = config === undefined ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `${typePart}fts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose tsvector value on the stated `column` matches
         * to_tsquery(`query`).
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         *
         * @deprecated Use `textSearch()` instead.
         */
        fts(column, query, { config } = {}) {
            const configPart = typeof config === 'undefined' ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `fts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose tsvector value on the stated `column` matches
         * plainto_tsquery(`query`).
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         *
         * @deprecated Use `textSearch()` with `type: 'plain'` instead.
         */
        plfts(column, query, { config } = {}) {
            const configPart = typeof config === 'undefined' ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `plfts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose tsvector value on the stated `column` matches
         * phraseto_tsquery(`query`).
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         *
         * @deprecated Use `textSearch()` with `type: 'phrase'` instead.
         */
        phfts(column, query, { config } = {}) {
            const configPart = typeof config === 'undefined' ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `phfts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose tsvector value on the stated `column` matches
         * websearch_to_tsquery(`query`).
         *
         * @param column  The column to filter on.
         * @param query  The Postgres tsquery string to filter with.
         * @param config  The text search configuration to use.
         *
         * @deprecated Use `textSearch()` with `type: 'websearch'` instead.
         */
        wfts(column, query, { config } = {}) {
            const configPart = typeof config === 'undefined' ? '' : `(${config})`;
            this.url.searchParams.append(`${column}`, `wfts${configPart}.${query}`);
            return this;
        }
        /**
         * Finds all rows whose `column` satisfies the filter.
         *
         * @param column  The column to filter on.
         * @param operator  The operator to filter with.
         * @param value  The value to filter with.
         */
        filter(column, operator, value) {
            this.url.searchParams.append(`${column}`, `${operator}.${value}`);
            return this;
        }
        /**
         * Finds all rows whose columns match the specified `query` object.
         *
         * @param query  The object to filter with, with column names as keys mapped
         *               to their filter values.
         */
        match(query) {
            Object.keys(query).forEach((key) => {
                this.url.searchParams.append(`${key}`, `eq.${query[key]}`);
            });
            return this;
        }
    }

    class PostgrestQueryBuilder extends PostgrestBuilder {
        constructor(url, { headers = {}, schema } = {}) {
            super({});
            this.url = new URL(url);
            this.headers = Object.assign({}, headers);
            this.schema = schema;
        }
        /**
         * Performs vertical filtering with SELECT.
         *
         * @param columns  The columns to retrieve, separated by commas.
         * @param head  When set to true, select will void data.
         * @param count  Count algorithm to use to count rows in a table.
         */
        select(columns = '*', { head = false, count = null, } = {}) {
            this.method = 'GET';
            // Remove whitespaces except when quoted
            let quoted = false;
            const cleanedColumns = columns
                .split('')
                .map((c) => {
                if (/\s/.test(c) && !quoted) {
                    return '';
                }
                if (c === '"') {
                    quoted = !quoted;
                }
                return c;
            })
                .join('');
            this.url.searchParams.set('select', cleanedColumns);
            if (count) {
                this.headers['Prefer'] = `count=${count}`;
            }
            if (head) {
                this.method = 'HEAD';
            }
            return new PostgrestFilterBuilder(this);
        }
        insert(values, { upsert = false, onConflict, returning = 'representation', count = null, } = {}) {
            this.method = 'POST';
            const prefersHeaders = [`return=${returning}`];
            if (upsert)
                prefersHeaders.push('resolution=merge-duplicates');
            if (upsert && onConflict !== undefined)
                this.url.searchParams.set('on_conflict', onConflict);
            this.body = values;
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            if (Array.isArray(values)) {
                const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
                if (columns.length > 0) {
                    const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
                    this.url.searchParams.set('columns', uniqueColumns.join(','));
                }
            }
            return new PostgrestFilterBuilder(this);
        }
        /**
         * Performs an UPSERT into the table.
         *
         * @param values  The values to insert.
         * @param onConflict  By specifying the `on_conflict` query parameter, you can make UPSERT work on a column(s) that has a UNIQUE constraint.
         * @param returning  By default the new record is returned. Set this to 'minimal' if you don't need this value.
         * @param count  Count algorithm to use to count rows in a table.
         * @param ignoreDuplicates  Specifies if duplicate rows should be ignored and not inserted.
         */
        upsert(values, { onConflict, returning = 'representation', count = null, ignoreDuplicates = false, } = {}) {
            this.method = 'POST';
            const prefersHeaders = [
                `resolution=${ignoreDuplicates ? 'ignore' : 'merge'}-duplicates`,
                `return=${returning}`,
            ];
            if (onConflict !== undefined)
                this.url.searchParams.set('on_conflict', onConflict);
            this.body = values;
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            return new PostgrestFilterBuilder(this);
        }
        /**
         * Performs an UPDATE on the table.
         *
         * @param values  The values to update.
         * @param returning  By default the updated record is returned. Set this to 'minimal' if you don't need this value.
         * @param count  Count algorithm to use to count rows in a table.
         */
        update(values, { returning = 'representation', count = null, } = {}) {
            this.method = 'PATCH';
            const prefersHeaders = [`return=${returning}`];
            this.body = values;
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            return new PostgrestFilterBuilder(this);
        }
        /**
         * Performs a DELETE on the table.
         *
         * @param returning  If `true`, return the deleted row(s) in the response.
         * @param count  Count algorithm to use to count rows in a table.
         */
        delete({ returning = 'representation', count = null, } = {}) {
            this.method = 'DELETE';
            const prefersHeaders = [`return=${returning}`];
            if (count) {
                prefersHeaders.push(`count=${count}`);
            }
            this.headers['Prefer'] = prefersHeaders.join(',');
            return new PostgrestFilterBuilder(this);
        }
    }

    class PostgrestRpcBuilder extends PostgrestBuilder {
        constructor(url, { headers = {}, schema } = {}) {
            super({});
            this.url = new URL(url);
            this.headers = Object.assign({}, headers);
            this.schema = schema;
        }
        /**
         * Perform a function call.
         */
        rpc(params, { count = null, } = {}) {
            this.method = 'POST';
            this.body = params;
            if (count) {
                if (this.headers['Prefer'] !== undefined)
                    this.headers['Prefer'] += `,count=${count}`;
                else
                    this.headers['Prefer'] = `count=${count}`;
            }
            return new PostgrestFilterBuilder(this);
        }
    }

    // generated by genversion
    const version$1 = '0.33.3';

    const DEFAULT_HEADERS$2 = { 'X-Client-Info': `postgrest-js/${version$1}` };

    class PostgrestClient {
        /**
         * Creates a PostgREST client.
         *
         * @param url  URL of the PostgREST endpoint.
         * @param headers  Custom headers.
         * @param schema  Postgres schema to switch to.
         */
        constructor(url, { headers = {}, schema } = {}) {
            this.url = url;
            this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$2), headers);
            this.schema = schema;
        }
        /**
         * Authenticates the request with JWT.
         *
         * @param token  The JWT token to use.
         */
        auth(token) {
            this.headers['Authorization'] = `Bearer ${token}`;
            return this;
        }
        /**
         * Perform a table operation.
         *
         * @param table  The table name to operate on.
         */
        from(table) {
            const url = `${this.url}/${table}`;
            return new PostgrestQueryBuilder(url, { headers: this.headers, schema: this.schema });
        }
        /**
         * Perform a function call.
         *
         * @param fn  The function name to call.
         * @param params  The parameters to pass to the function call.
         * @param count  Count algorithm to use to count rows in a table.
         */
        rpc(fn, params, { count = null, } = {}) {
            const url = `${this.url}/rpc/${fn}`;
            return new PostgrestRpcBuilder(url, {
                headers: this.headers,
                schema: this.schema,
            }).rpc(params, { count });
        }
    }

    /**
     * Helpers to convert the change Payload into native JS types.
     */
    // Adapted from epgsql (src/epgsql_binary.erl), this module licensed under
    // 3-clause BSD found here: https://raw.githubusercontent.com/epgsql/epgsql/devel/LICENSE
    var PostgresTypes;
    (function (PostgresTypes) {
        PostgresTypes["abstime"] = "abstime";
        PostgresTypes["bool"] = "bool";
        PostgresTypes["date"] = "date";
        PostgresTypes["daterange"] = "daterange";
        PostgresTypes["float4"] = "float4";
        PostgresTypes["float8"] = "float8";
        PostgresTypes["int2"] = "int2";
        PostgresTypes["int4"] = "int4";
        PostgresTypes["int4range"] = "int4range";
        PostgresTypes["int8"] = "int8";
        PostgresTypes["int8range"] = "int8range";
        PostgresTypes["json"] = "json";
        PostgresTypes["jsonb"] = "jsonb";
        PostgresTypes["money"] = "money";
        PostgresTypes["numeric"] = "numeric";
        PostgresTypes["oid"] = "oid";
        PostgresTypes["reltime"] = "reltime";
        PostgresTypes["time"] = "time";
        PostgresTypes["timestamp"] = "timestamp";
        PostgresTypes["timestamptz"] = "timestamptz";
        PostgresTypes["timetz"] = "timetz";
        PostgresTypes["tsrange"] = "tsrange";
        PostgresTypes["tstzrange"] = "tstzrange";
    })(PostgresTypes || (PostgresTypes = {}));
    /**
     * Takes an array of columns and an object of string values then converts each string value
     * to its mapped type.
     *
     * @param {{name: String, type: String}[]} columns
     * @param {Object} records
     * @param {Object} options The map of various options that can be applied to the mapper
     * @param {Array} options.skipTypes The array of types that should not be converted
     *
     * @example convertChangeData([{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age:'33'}, {})
     * //=>{ first_name: 'Paul', age: 33 }
     */
    const convertChangeData = (columns, records, options = {}) => {
        let result = {};
        let skipTypes = typeof options.skipTypes !== 'undefined' ? options.skipTypes : [];
        Object.entries(records).map(([key, value]) => {
            result[key] = convertColumn(key, columns, records, skipTypes);
        });
        return result;
    };
    /**
     * Converts the value of an individual column.
     *
     * @param {String} columnName The column that you want to convert
     * @param {{name: String, type: String}[]} columns All of the columns
     * @param {Object} records The map of string values
     * @param {Array} skipTypes An array of types that should not be converted
     * @return {object} Useless information
     *
     * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, [])
     * //=> 33
     * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, ['int4'])
     * //=> "33"
     */
    const convertColumn = (columnName, columns, records, skipTypes) => {
        let column = columns.find((x) => x.name == columnName);
        if (!column || skipTypes.includes(column.type)) {
            return noop$1(records[columnName]);
        }
        else {
            return convertCell(column.type, records[columnName]);
        }
    };
    /**
     * If the value of the cell is `null`, returns null.
     * Otherwise converts the string value to the correct type.
     * @param {String} type A postgres column type
     * @param {String} stringValue The cell value
     *
     * @example convertCell('bool', 't')
     * //=> true
     * @example convertCell('int8', '10')
     * //=> 10
     * @example convertCell('_int4', '{1,2,3,4}')
     * //=> [1,2,3,4]
     */
    const convertCell = (type, stringValue) => {
        try {
            if (stringValue === null)
                return null;
            // if data type is an array
            if (type.charAt(0) === '_') {
                let arrayValue = type.slice(1, type.length);
                return toArray(stringValue, arrayValue);
            }
            // If not null, convert to correct type.
            switch (type) {
                case PostgresTypes.abstime:
                    return noop$1(stringValue); // To allow users to cast it based on Timezone
                case PostgresTypes.bool:
                    return toBoolean(stringValue);
                case PostgresTypes.date:
                    return noop$1(stringValue); // To allow users to cast it based on Timezone
                case PostgresTypes.daterange:
                    return toDateRange(stringValue);
                case PostgresTypes.float4:
                    return toFloat(stringValue);
                case PostgresTypes.float8:
                    return toFloat(stringValue);
                case PostgresTypes.int2:
                    return toInt(stringValue);
                case PostgresTypes.int4:
                    return toInt(stringValue);
                case PostgresTypes.int4range:
                    return toIntRange(stringValue);
                case PostgresTypes.int8:
                    return toInt(stringValue);
                case PostgresTypes.int8range:
                    return toIntRange(stringValue);
                case PostgresTypes.json:
                    return toJson(stringValue);
                case PostgresTypes.jsonb:
                    return toJson(stringValue);
                case PostgresTypes.money:
                    return toFloat(stringValue);
                case PostgresTypes.numeric:
                    return toFloat(stringValue);
                case PostgresTypes.oid:
                    return toInt(stringValue);
                case PostgresTypes.reltime:
                    return noop$1(stringValue); // To allow users to cast it based on Timezone
                case PostgresTypes.time:
                    return noop$1(stringValue); // To allow users to cast it based on Timezone
                case PostgresTypes.timestamp:
                    return toTimestampString(stringValue); // Format to be consistent with PostgREST
                case PostgresTypes.timestamptz:
                    return noop$1(stringValue); // To allow users to cast it based on Timezone
                case PostgresTypes.timetz:
                    return noop$1(stringValue); // To allow users to cast it based on Timezone
                case PostgresTypes.tsrange:
                    return toDateRange(stringValue);
                case PostgresTypes.tstzrange:
                    return toDateRange(stringValue);
                default:
                    // All the rest will be returned as strings
                    return noop$1(stringValue);
            }
        }
        catch (error) {
            console.log(`Could not convert cell of type ${type} and value ${stringValue}`);
            console.log(`This is the error: ${error}`);
            return stringValue;
        }
    };
    const noop$1 = (stringValue) => {
        return stringValue;
    };
    const toBoolean = (stringValue) => {
        switch (stringValue) {
            case 't':
                return true;
            case 'f':
                return false;
            default:
                return null;
        }
    };
    const toDateRange = (stringValue) => {
        let arr = JSON.parse(stringValue);
        return [new Date(arr[0]), new Date(arr[1])];
    };
    const toFloat = (stringValue) => {
        return parseFloat(stringValue);
    };
    const toInt = (stringValue) => {
        return parseInt(stringValue);
    };
    const toIntRange = (stringValue) => {
        let arr = JSON.parse(stringValue);
        return [parseInt(arr[0]), parseInt(arr[1])];
    };
    const toJson = (stringValue) => {
        return JSON.parse(stringValue);
    };
    /**
     * Converts a Postgres Array into a native JS array
     *
     * @example toArray('{1,2,3,4}', 'int4')
     * //=> [1,2,3,4]
     * @example toArray('{}', 'int4')
     * //=> []
     */
    const toArray = (stringValue, type) => {
        // this takes off the '{' & '}'
        let stringEnriched = stringValue.slice(1, stringValue.length - 1);
        // converts the string into an array
        // if string is empty (meaning the array was empty), an empty array will be immediately returned
        let stringArray = stringEnriched.length > 0 ? stringEnriched.split(',') : [];
        let array = stringArray.map((string) => {
            return convertCell(type, string);
        });
        return array;
    };
    /**
     * Fixes timestamp to be ISO-8601. Swaps the space between the date and time for a 'T'
     * See https://github.com/supabase/supabase/issues/18
     *
     * @example toTimestampString('2019-09-10 00:00:00')
     * //=> '2019-09-10T00:00:00'
     */
    const toTimestampString = (stringValue) => {
        return stringValue.replace(' ', 'T');
    };

    // generated by genversion
    const version$2 = '1.1.3';

    const DEFAULT_HEADERS$3 = { 'X-Client-Info': `realtime-js/${version$2}` };
    const VSN = '1.0.0';
    const DEFAULT_TIMEOUT = 10000;
    const WS_CLOSE_NORMAL = 1000;
    var SOCKET_STATES;
    (function (SOCKET_STATES) {
        SOCKET_STATES[SOCKET_STATES["connecting"] = 0] = "connecting";
        SOCKET_STATES[SOCKET_STATES["open"] = 1] = "open";
        SOCKET_STATES[SOCKET_STATES["closing"] = 2] = "closing";
        SOCKET_STATES[SOCKET_STATES["closed"] = 3] = "closed";
    })(SOCKET_STATES || (SOCKET_STATES = {}));
    var CHANNEL_STATES;
    (function (CHANNEL_STATES) {
        CHANNEL_STATES["closed"] = "closed";
        CHANNEL_STATES["errored"] = "errored";
        CHANNEL_STATES["joined"] = "joined";
        CHANNEL_STATES["joining"] = "joining";
        CHANNEL_STATES["leaving"] = "leaving";
    })(CHANNEL_STATES || (CHANNEL_STATES = {}));
    var CHANNEL_EVENTS;
    (function (CHANNEL_EVENTS) {
        CHANNEL_EVENTS["close"] = "phx_close";
        CHANNEL_EVENTS["error"] = "phx_error";
        CHANNEL_EVENTS["join"] = "phx_join";
        CHANNEL_EVENTS["reply"] = "phx_reply";
        CHANNEL_EVENTS["leave"] = "phx_leave";
    })(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
    var TRANSPORTS;
    (function (TRANSPORTS) {
        TRANSPORTS["websocket"] = "websocket";
    })(TRANSPORTS || (TRANSPORTS = {}));

    /**
     * Creates a timer that accepts a `timerCalc` function to perform calculated timeout retries, such as exponential backoff.
     *
     * @example
     *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
     *      return [1000, 5000, 10000][tries - 1] || 10000
     *    })
     *    reconnectTimer.scheduleTimeout() // fires after 1000
     *    reconnectTimer.scheduleTimeout() // fires after 5000
     *    reconnectTimer.reset()
     *    reconnectTimer.scheduleTimeout() // fires after 1000
     */
    class Timer {
        constructor(callback, timerCalc) {
            this.callback = callback;
            this.timerCalc = timerCalc;
            this.timer = undefined;
            this.tries = 0;
            this.callback = callback;
            this.timerCalc = timerCalc;
        }
        reset() {
            this.tries = 0;
            clearTimeout(this.timer);
        }
        // Cancels any previous scheduleTimeout and schedules callback
        scheduleTimeout() {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.tries = this.tries + 1;
                this.callback();
            }, this.timerCalc(this.tries + 1));
        }
    }

    class Push {
        /**
         * Initializes the Push
         *
         * @param channel The Channel
         * @param event The event, for example `"phx_join"`
         * @param payload The payload, for example `{user_id: 123}`
         * @param timeout The push timeout in milliseconds
         */
        constructor(channel, event, payload = {}, timeout = DEFAULT_TIMEOUT) {
            this.channel = channel;
            this.event = event;
            this.payload = payload;
            this.timeout = timeout;
            this.sent = false;
            this.timeoutTimer = undefined;
            this.ref = '';
            this.receivedResp = null;
            this.recHooks = [];
            this.refEvent = null;
        }
        resend(timeout) {
            this.timeout = timeout;
            this._cancelRefEvent();
            this.ref = '';
            this.refEvent = null;
            this.receivedResp = null;
            this.sent = false;
            this.send();
        }
        send() {
            if (this._hasReceived('timeout')) {
                return;
            }
            this.startTimeout();
            this.sent = true;
            this.channel.socket.push({
                topic: this.channel.topic,
                event: this.event,
                payload: this.payload,
                ref: this.ref,
            });
        }
        receive(status, callback) {
            var _a;
            if (this._hasReceived(status)) {
                callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
            }
            this.recHooks.push({ status, callback });
            return this;
        }
        startTimeout() {
            if (this.timeoutTimer) {
                return;
            }
            this.ref = this.channel.socket.makeRef();
            this.refEvent = this.channel.replyEventName(this.ref);
            this.channel.on(this.refEvent, (payload) => {
                this._cancelRefEvent();
                this._cancelTimeout();
                this.receivedResp = payload;
                this._matchReceive(payload);
            });
            this.timeoutTimer = setTimeout(() => {
                this.trigger('timeout', {});
            }, this.timeout);
        }
        trigger(status, response) {
            if (this.refEvent)
                this.channel.trigger(this.refEvent, { status, response });
        }
        destroy() {
            this._cancelRefEvent();
            this._cancelTimeout();
        }
        _cancelRefEvent() {
            if (!this.refEvent) {
                return;
            }
            this.channel.off(this.refEvent);
        }
        _cancelTimeout() {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = undefined;
        }
        _matchReceive({ status, response, }) {
            this.recHooks
                .filter((h) => h.status === status)
                .forEach((h) => h.callback(response));
        }
        _hasReceived(status) {
            return this.receivedResp && this.receivedResp.status === status;
        }
    }

    class RealtimeSubscription {
        constructor(topic, params = {}, socket) {
            this.topic = topic;
            this.params = params;
            this.socket = socket;
            this.bindings = [];
            this.state = CHANNEL_STATES.closed;
            this.joinedOnce = false;
            this.pushBuffer = [];
            this.timeout = this.socket.timeout;
            this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
            this.rejoinTimer = new Timer(() => this.rejoinUntilConnected(), this.socket.reconnectAfterMs);
            this.joinPush.receive('ok', () => {
                this.state = CHANNEL_STATES.joined;
                this.rejoinTimer.reset();
                this.pushBuffer.forEach((pushEvent) => pushEvent.send());
                this.pushBuffer = [];
            });
            this.onClose(() => {
                this.rejoinTimer.reset();
                this.socket.log('channel', `close ${this.topic} ${this.joinRef()}`);
                this.state = CHANNEL_STATES.closed;
                this.socket.remove(this);
            });
            this.onError((reason) => {
                if (this.isLeaving() || this.isClosed()) {
                    return;
                }
                this.socket.log('channel', `error ${this.topic}`, reason);
                this.state = CHANNEL_STATES.errored;
                this.rejoinTimer.scheduleTimeout();
            });
            this.joinPush.receive('timeout', () => {
                if (!this.isJoining()) {
                    return;
                }
                this.socket.log('channel', `timeout ${this.topic}`, this.joinPush.timeout);
                this.state = CHANNEL_STATES.errored;
                this.rejoinTimer.scheduleTimeout();
            });
            this.on(CHANNEL_EVENTS.reply, (payload, ref) => {
                this.trigger(this.replyEventName(ref), payload);
            });
        }
        rejoinUntilConnected() {
            this.rejoinTimer.scheduleTimeout();
            if (this.socket.isConnected()) {
                this.rejoin();
            }
        }
        subscribe(timeout = this.timeout) {
            if (this.joinedOnce) {
                throw `tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance`;
            }
            else {
                this.joinedOnce = true;
                this.rejoin(timeout);
                return this.joinPush;
            }
        }
        onClose(callback) {
            this.on(CHANNEL_EVENTS.close, callback);
        }
        onError(callback) {
            this.on(CHANNEL_EVENTS.error, (reason) => callback(reason));
        }
        on(event, callback) {
            this.bindings.push({ event, callback });
        }
        off(event) {
            this.bindings = this.bindings.filter((bind) => bind.event !== event);
        }
        canPush() {
            return this.socket.isConnected() && this.isJoined();
        }
        push(event, payload, timeout = this.timeout) {
            if (!this.joinedOnce) {
                throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
            }
            let pushEvent = new Push(this, event, payload, timeout);
            if (this.canPush()) {
                pushEvent.send();
            }
            else {
                pushEvent.startTimeout();
                this.pushBuffer.push(pushEvent);
            }
            return pushEvent;
        }
        /**
         * Leaves the channel
         *
         * Unsubscribes from server events, and instructs channel to terminate on server.
         * Triggers onClose() hooks.
         *
         * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
         * channel.unsubscribe().receive("ok", () => alert("left!") )
         */
        unsubscribe(timeout = this.timeout) {
            this.state = CHANNEL_STATES.leaving;
            let onClose = () => {
                this.socket.log('channel', `leave ${this.topic}`);
                this.trigger(CHANNEL_EVENTS.close, 'leave', this.joinRef());
            };
            // Destroy joinPush to avoid connection timeouts during unscription phase
            this.joinPush.destroy();
            let leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
            leavePush.receive('ok', () => onClose()).receive('timeout', () => onClose());
            leavePush.send();
            if (!this.canPush()) {
                leavePush.trigger('ok', {});
            }
            return leavePush;
        }
        /**
         * Overridable message hook
         *
         * Receives all events for specialized message handling before dispatching to the channel callbacks.
         * Must return the payload, modified or unmodified.
         */
        onMessage(event, payload, ref) {
            return payload;
        }
        isMember(topic) {
            return this.topic === topic;
        }
        joinRef() {
            return this.joinPush.ref;
        }
        sendJoin(timeout) {
            this.state = CHANNEL_STATES.joining;
            this.joinPush.resend(timeout);
        }
        rejoin(timeout = this.timeout) {
            if (this.isLeaving()) {
                return;
            }
            this.sendJoin(timeout);
        }
        trigger(event, payload, ref) {
            let { close, error, leave, join } = CHANNEL_EVENTS;
            let events = [close, error, leave, join];
            if (ref && events.indexOf(event) >= 0 && ref !== this.joinRef()) {
                return;
            }
            let handledPayload = this.onMessage(event, payload, ref);
            if (payload && !handledPayload) {
                throw 'channel onMessage callbacks must return the payload, modified or unmodified';
            }
            this.bindings
                .filter((bind) => {
                // Bind all events if the user specifies a wildcard.
                if (bind.event === '*') {
                    return event === (payload === null || payload === void 0 ? void 0 : payload.type);
                }
                else {
                    return bind.event === event;
                }
            })
                .map((bind) => bind.callback(handledPayload, ref));
        }
        replyEventName(ref) {
            return `chan_reply_${ref}`;
        }
        isClosed() {
            return this.state === CHANNEL_STATES.closed;
        }
        isErrored() {
            return this.state === CHANNEL_STATES.errored;
        }
        isJoined() {
            return this.state === CHANNEL_STATES.joined;
        }
        isJoining() {
            return this.state === CHANNEL_STATES.joining;
        }
        isLeaving() {
            return this.state === CHANNEL_STATES.leaving;
        }
    }

    var naiveFallback = function () {
    	if (typeof self === "object" && self) return self;
    	if (typeof window === "object" && window) return window;
    	throw new Error("Unable to resolve global `this`");
    };

    var global$1 = (function () {
    	if (this) return this;

    	// Unexpected strict mode (may happen if e.g. bundled into ESM module)

    	// Fallback to standard globalThis if available
    	if (typeof globalThis === "object" && globalThis) return globalThis;

    	// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
    	// In all ES5+ engines global object inherits from Object.prototype
    	// (if you approached one that doesn't please report)
    	try {
    		Object.defineProperty(Object.prototype, "__global__", {
    			get: function () { return this; },
    			configurable: true
    		});
    	} catch (error) {
    		// Unfortunate case of updates to Object.prototype being restricted
    		// via preventExtensions, seal or freeze
    		return naiveFallback();
    	}
    	try {
    		// Safari case (window.__global__ works, but __global__ does not)
    		if (!__global__) return naiveFallback();
    		return __global__;
    	} finally {
    		delete Object.prototype.__global__;
    	}
    })();

    var _from = "websocket@^1.0.34";
    var _id = "websocket@1.0.34";
    var _inBundle = false;
    var _integrity = "sha512-PRDso2sGwF6kM75QykIesBijKSVceR6jL2G8NGYyq2XrItNC2P5/qL5XeR056GhA+Ly7JMFvJb9I312mJfmqnQ==";
    var _location = "/websocket";
    var _phantomChildren = {
    };
    var _requested = {
    	type: "range",
    	registry: true,
    	raw: "websocket@^1.0.34",
    	name: "websocket",
    	escapedName: "websocket",
    	rawSpec: "^1.0.34",
    	saveSpec: null,
    	fetchSpec: "^1.0.34"
    };
    var _requiredBy = [
    	"/@supabase/realtime-js"
    ];
    var _resolved = "https://registry.npmjs.org/websocket/-/websocket-1.0.34.tgz";
    var _shasum = "2bdc2602c08bf2c82253b730655c0ef7dcab3111";
    var _spec = "websocket@^1.0.34";
    var _where = "/home/zaki/Documents/My Projects/QuizGame-Svelte-Dashboard/node_modules/@supabase/realtime-js";
    var author = {
    	name: "Brian McKelvey",
    	email: "theturtle32@gmail.com",
    	url: "https://github.com/theturtle32"
    };
    var browser = "lib/browser.js";
    var bugs = {
    	url: "https://github.com/theturtle32/WebSocket-Node/issues"
    };
    var bundleDependencies = false;
    var config = {
    	verbose: false
    };
    var contributors = [
    	{
    		name: "Iñaki Baz Castillo",
    		email: "ibc@aliax.net",
    		url: "http://dev.sipdoc.net"
    	}
    ];
    var dependencies = {
    	bufferutil: "^4.0.1",
    	debug: "^2.2.0",
    	"es5-ext": "^0.10.50",
    	"typedarray-to-buffer": "^3.1.5",
    	"utf-8-validate": "^5.0.2",
    	yaeti: "^0.0.6"
    };
    var deprecated = false;
    var description = "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.";
    var devDependencies = {
    	"buffer-equal": "^1.0.0",
    	gulp: "^4.0.2",
    	"gulp-jshint": "^2.0.4",
    	jshint: "^2.0.0",
    	"jshint-stylish": "^2.2.1",
    	tape: "^4.9.1"
    };
    var directories = {
    	lib: "./lib"
    };
    var engines = {
    	node: ">=4.0.0"
    };
    var homepage = "https://github.com/theturtle32/WebSocket-Node";
    var keywords = [
    	"websocket",
    	"websockets",
    	"socket",
    	"networking",
    	"comet",
    	"push",
    	"RFC-6455",
    	"realtime",
    	"server",
    	"client"
    ];
    var license = "Apache-2.0";
    var main = "index";
    var name = "websocket";
    var repository = {
    	type: "git",
    	url: "git+https://github.com/theturtle32/WebSocket-Node.git"
    };
    var scripts = {
    	gulp: "gulp",
    	test: "tape test/unit/*.js"
    };
    var version$3 = "1.0.34";
    var _package = {
    	_from: _from,
    	_id: _id,
    	_inBundle: _inBundle,
    	_integrity: _integrity,
    	_location: _location,
    	_phantomChildren: _phantomChildren,
    	_requested: _requested,
    	_requiredBy: _requiredBy,
    	_resolved: _resolved,
    	_shasum: _shasum,
    	_spec: _spec,
    	_where: _where,
    	author: author,
    	browser: browser,
    	bugs: bugs,
    	bundleDependencies: bundleDependencies,
    	config: config,
    	contributors: contributors,
    	dependencies: dependencies,
    	deprecated: deprecated,
    	description: description,
    	devDependencies: devDependencies,
    	directories: directories,
    	engines: engines,
    	homepage: homepage,
    	keywords: keywords,
    	license: license,
    	main: main,
    	name: name,
    	repository: repository,
    	scripts: scripts,
    	version: version$3
    };

    var _package$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        _from: _from,
        _id: _id,
        _inBundle: _inBundle,
        _integrity: _integrity,
        _location: _location,
        _phantomChildren: _phantomChildren,
        _requested: _requested,
        _requiredBy: _requiredBy,
        _resolved: _resolved,
        _shasum: _shasum,
        _spec: _spec,
        _where: _where,
        author: author,
        browser: browser,
        bugs: bugs,
        bundleDependencies: bundleDependencies,
        config: config,
        contributors: contributors,
        dependencies: dependencies,
        deprecated: deprecated,
        description: description,
        devDependencies: devDependencies,
        directories: directories,
        engines: engines,
        homepage: homepage,
        keywords: keywords,
        license: license,
        main: main,
        name: name,
        repository: repository,
        scripts: scripts,
        version: version$3,
        'default': _package
    });

    var require$$0 = getCjsExportFromNamespace(_package$1);

    var version$4 = require$$0.version;

    var _globalThis;
    if (typeof globalThis === 'object') {
    	_globalThis = globalThis;
    } else {
    	try {
    		_globalThis = global$1;
    	} catch (error) {
    	} finally {
    		if (!_globalThis && typeof window !== 'undefined') { _globalThis = window; }
    		if (!_globalThis) { throw new Error('Could not determine global this'); }
    	}
    }

    var NativeWebSocket = _globalThis.WebSocket || _globalThis.MozWebSocket;



    /**
     * Expose a W3C WebSocket class with just one or two arguments.
     */
    function W3CWebSocket(uri, protocols) {
    	var native_instance;

    	if (protocols) {
    		native_instance = new NativeWebSocket(uri, protocols);
    	}
    	else {
    		native_instance = new NativeWebSocket(uri);
    	}

    	/**
    	 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
    	 * class). Since it is an Object it will be returned as it is when creating an
    	 * instance of W3CWebSocket via 'new W3CWebSocket()'.
    	 *
    	 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
    	 */
    	return native_instance;
    }
    if (NativeWebSocket) {
    	['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'].forEach(function(prop) {
    		Object.defineProperty(W3CWebSocket, prop, {
    			get: function() { return NativeWebSocket[prop]; }
    		});
    	});
    }

    /**
     * Module exports.
     */
    var browser$1 = {
        'w3cwebsocket' : NativeWebSocket ? W3CWebSocket : null,
        'version'      : version$4
    };

    // This file draws heavily from https://github.com/phoenixframework/phoenix/commit/cf098e9cf7a44ee6479d31d911a97d3c7430c6fe
    // License: https://github.com/phoenixframework/phoenix/blob/master/LICENSE.md
    class Serializer {
        constructor() {
            this.HEADER_LENGTH = 1;
        }
        decode(rawPayload, callback) {
            if (rawPayload.constructor === ArrayBuffer) {
                return callback(this._binaryDecode(rawPayload));
            }
            if (typeof rawPayload === 'string') {
                return callback(JSON.parse(rawPayload));
            }
            return callback({});
        }
        _binaryDecode(buffer) {
            const view = new DataView(buffer);
            const decoder = new TextDecoder();
            return this._decodeBroadcast(buffer, view, decoder);
        }
        _decodeBroadcast(buffer, view, decoder) {
            const topicSize = view.getUint8(1);
            const eventSize = view.getUint8(2);
            let offset = this.HEADER_LENGTH + 2;
            const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
            offset = offset + topicSize;
            const event = decoder.decode(buffer.slice(offset, offset + eventSize));
            offset = offset + eventSize;
            const data = JSON.parse(decoder.decode(buffer.slice(offset, buffer.byteLength)));
            return { ref: null, topic: topic, event: event, payload: data };
        }
    }

    var __awaiter$4 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const noop$2 = () => { };
    class RealtimeClient {
        /**
         * Initializes the Socket
         *
         * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
         * @param options.transport The Websocket Transport, for example WebSocket.
         * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
         * @param options.params The optional params to pass when connecting.
         * @param options.headers The optional headers to pass when connecting.
         * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
         * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
         * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
         * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
         * @param options.longpollerTimeout The maximum timeout of a long poll AJAX request. Defaults to 20s (double the server long poll timer).
         * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
         */
        constructor(endPoint, options) {
            this.channels = [];
            this.endPoint = '';
            this.headers = DEFAULT_HEADERS$3;
            this.params = {};
            this.timeout = DEFAULT_TIMEOUT;
            this.transport = browser$1.w3cwebsocket;
            this.heartbeatIntervalMs = 30000;
            this.longpollerTimeout = 20000;
            this.heartbeatTimer = undefined;
            this.pendingHeartbeatRef = null;
            this.ref = 0;
            this.logger = noop$2;
            this.conn = null;
            this.sendBuffer = [];
            this.serializer = new Serializer();
            this.stateChangeCallbacks = {
                open: [],
                close: [],
                error: [],
                message: [],
            };
            this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
            if (options === null || options === void 0 ? void 0 : options.params)
                this.params = options.params;
            if (options === null || options === void 0 ? void 0 : options.headers)
                this.headers = Object.assign(Object.assign({}, this.headers), options.headers);
            if (options === null || options === void 0 ? void 0 : options.timeout)
                this.timeout = options.timeout;
            if (options === null || options === void 0 ? void 0 : options.logger)
                this.logger = options.logger;
            if (options === null || options === void 0 ? void 0 : options.transport)
                this.transport = options.transport;
            if (options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs)
                this.heartbeatIntervalMs = options.heartbeatIntervalMs;
            if (options === null || options === void 0 ? void 0 : options.longpollerTimeout)
                this.longpollerTimeout = options.longpollerTimeout;
            this.reconnectAfterMs = (options === null || options === void 0 ? void 0 : options.reconnectAfterMs) ? options.reconnectAfterMs
                : (tries) => {
                    return [1000, 2000, 5000, 10000][tries - 1] || 10000;
                };
            this.encode = (options === null || options === void 0 ? void 0 : options.encode) ? options.encode
                : (payload, callback) => {
                    return callback(JSON.stringify(payload));
                };
            this.decode = (options === null || options === void 0 ? void 0 : options.decode) ? options.decode
                : this.serializer.decode.bind(this.serializer);
            this.reconnectTimer = new Timer(() => __awaiter$4(this, void 0, void 0, function* () {
                yield this.disconnect();
                this.connect();
            }), this.reconnectAfterMs);
        }
        /**
         * Connects the socket.
         */
        connect() {
            if (this.conn) {
                return;
            }
            this.conn = new this.transport(this.endPointURL(), [], null, this.headers);
            if (this.conn) {
                // this.conn.timeout = this.longpollerTimeout // TYPE ERROR
                this.conn.binaryType = 'arraybuffer';
                this.conn.onopen = () => this._onConnOpen();
                this.conn.onerror = (error) => this._onConnError(error);
                this.conn.onmessage = (event) => this.onConnMessage(event);
                this.conn.onclose = (event) => this._onConnClose(event);
            }
        }
        /**
         * Disconnects the socket.
         *
         * @param code A numeric status code to send on disconnect.
         * @param reason A custom reason for the disconnect.
         */
        disconnect(code, reason) {
            return new Promise((resolve, _reject) => {
                try {
                    if (this.conn) {
                        this.conn.onclose = function () { }; // noop
                        if (code) {
                            this.conn.close(code, reason || '');
                        }
                        else {
                            this.conn.close();
                        }
                        this.conn = null;
                        // remove open handles
                        this.heartbeatTimer && clearInterval(this.heartbeatTimer);
                        this.reconnectTimer.reset();
                    }
                    resolve({ error: null, data: true });
                }
                catch (error) {
                    resolve({ error, data: false });
                }
            });
        }
        /**
         * Logs the message. Override `this.logger` for specialized logging.
         */
        log(kind, msg, data) {
            this.logger(kind, msg, data);
        }
        /**
         * Registers a callback for connection state change event.
         * @param callback A function to be called when the event occurs.
         *
         * @example
         *    socket.onOpen(() => console.log("Socket opened."))
         */
        onOpen(callback) {
            this.stateChangeCallbacks.open.push(callback);
        }
        /**
         * Registers a callbacks for connection state change events.
         * @param callback A function to be called when the event occurs.
         *
         * @example
         *    socket.onOpen(() => console.log("Socket closed."))
         */
        onClose(callback) {
            this.stateChangeCallbacks.close.push(callback);
        }
        /**
         * Registers a callback for connection state change events.
         * @param callback A function to be called when the event occurs.
         *
         * @example
         *    socket.onOpen((error) => console.log("An error occurred"))
         */
        onError(callback) {
            this.stateChangeCallbacks.error.push(callback);
        }
        /**
         * Calls a function any time a message is received.
         * @param callback A function to be called when the event occurs.
         *
         * @example
         *    socket.onMessage((message) => console.log(message))
         */
        onMessage(callback) {
            this.stateChangeCallbacks.message.push(callback);
        }
        /**
         * Returns the current state of the socket.
         */
        connectionState() {
            switch (this.conn && this.conn.readyState) {
                case SOCKET_STATES.connecting:
                    return 'connecting';
                case SOCKET_STATES.open:
                    return 'open';
                case SOCKET_STATES.closing:
                    return 'closing';
                default:
                    return 'closed';
            }
        }
        /**
         * Retuns `true` is the connection is open.
         */
        isConnected() {
            return this.connectionState() === 'open';
        }
        /**
         * Removes a subscription from the socket.
         *
         * @param channel An open subscription.
         */
        remove(channel) {
            this.channels = this.channels.filter((c) => c.joinRef() !== channel.joinRef());
        }
        channel(topic, chanParams = {}) {
            let chan = new RealtimeSubscription(topic, chanParams, this);
            this.channels.push(chan);
            return chan;
        }
        push(data) {
            let { topic, event, payload, ref } = data;
            let callback = () => {
                this.encode(data, (result) => {
                    var _a;
                    (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
                });
            };
            this.log('push', `${topic} ${event} (${ref})`, payload);
            if (this.isConnected()) {
                callback();
            }
            else {
                this.sendBuffer.push(callback);
            }
        }
        onConnMessage(rawMessage) {
            this.decode(rawMessage.data, (msg) => {
                let { topic, event, payload, ref } = msg;
                if (ref && ref === this.pendingHeartbeatRef) {
                    this.pendingHeartbeatRef = null;
                }
                else if (event === (payload === null || payload === void 0 ? void 0 : payload.type)) {
                    this._resetHeartbeat();
                }
                this.log('receive', `${payload.status || ''} ${topic} ${event} ${(ref && '(' + ref + ')') || ''}`, payload);
                this.channels
                    .filter((channel) => channel.isMember(topic))
                    .forEach((channel) => channel.trigger(event, payload, ref));
                this.stateChangeCallbacks.message.forEach((callback) => callback(msg));
            });
        }
        /**
         * Returns the URL of the websocket.
         */
        endPointURL() {
            return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: VSN }));
        }
        /**
         * Return the next message ref, accounting for overflows
         */
        makeRef() {
            let newRef = this.ref + 1;
            if (newRef === this.ref) {
                this.ref = 0;
            }
            else {
                this.ref = newRef;
            }
            return this.ref.toString();
        }
        _onConnOpen() {
            this.log('transport', `connected to ${this.endPointURL()}`);
            this._flushSendBuffer();
            this.reconnectTimer.reset();
            this._resetHeartbeat();
            this.stateChangeCallbacks.open.forEach((callback) => callback());
        }
        _onConnClose(event) {
            this.log('transport', 'close', event);
            this._triggerChanError();
            this.heartbeatTimer && clearInterval(this.heartbeatTimer);
            this.reconnectTimer.scheduleTimeout();
            this.stateChangeCallbacks.close.forEach((callback) => callback(event));
        }
        _onConnError(error) {
            this.log('transport', error.message);
            this._triggerChanError();
            this.stateChangeCallbacks.error.forEach((callback) => callback(error));
        }
        _triggerChanError() {
            this.channels.forEach((channel) => channel.trigger(CHANNEL_EVENTS.error));
        }
        _appendParams(url, params) {
            if (Object.keys(params).length === 0) {
                return url;
            }
            const prefix = url.match(/\?/) ? '&' : '?';
            const query = new URLSearchParams(params);
            return `${url}${prefix}${query}`;
        }
        _flushSendBuffer() {
            if (this.isConnected() && this.sendBuffer.length > 0) {
                this.sendBuffer.forEach((callback) => callback());
                this.sendBuffer = [];
            }
        }
        _resetHeartbeat() {
            this.pendingHeartbeatRef = null;
            this.heartbeatTimer && clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = setInterval(() => this._sendHeartbeat(), this.heartbeatIntervalMs);
        }
        _sendHeartbeat() {
            var _a;
            if (!this.isConnected()) {
                return;
            }
            if (this.pendingHeartbeatRef) {
                this.pendingHeartbeatRef = null;
                this.log('transport', 'heartbeat timeout. Attempting to re-establish connection');
                (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(WS_CLOSE_NORMAL, 'hearbeat timeout');
                return;
            }
            this.pendingHeartbeatRef = this.makeRef();
            this.push({
                topic: 'phoenix',
                event: 'heartbeat',
                payload: {},
                ref: this.pendingHeartbeatRef,
            });
        }
    }

    class SupabaseRealtimeClient {
        constructor(socket, schema, tableName) {
            const topic = tableName === '*' ? `realtime:${schema}` : `realtime:${schema}:${tableName}`;
            this.subscription = socket.channel(topic);
        }
        getPayloadRecords(payload) {
            const records = {
                new: {},
                old: {},
            };
            if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
                records.new = convertChangeData(payload.columns, payload.record);
            }
            if (payload.type === 'UPDATE' || payload.type === 'DELETE') {
                records.old = convertChangeData(payload.columns, payload.old_record);
            }
            return records;
        }
        /**
         * The event you want to listen to.
         *
         * @param event The event
         * @param callback A callback function that is called whenever the event occurs.
         */
        on(event, callback) {
            this.subscription.on(event, (payload) => {
                let enrichedPayload = {
                    schema: payload.schema,
                    table: payload.table,
                    commit_timestamp: payload.commit_timestamp,
                    eventType: payload.type,
                    new: {},
                    old: {},
                };
                enrichedPayload = Object.assign(Object.assign({}, enrichedPayload), this.getPayloadRecords(payload));
                callback(enrichedPayload);
            });
            return this;
        }
        /**
         * Enables the subscription.
         */
        subscribe(callback = () => { }) {
            this.subscription.onError((e) => callback('SUBSCRIPTION_ERROR', e));
            this.subscription.onClose(() => callback('CLOSED'));
            this.subscription
                .subscribe()
                .receive('ok', () => callback('SUBSCRIBED'))
                .receive('error', (e) => callback('SUBSCRIPTION_ERROR', e))
                .receive('timeout', () => callback('RETRYING_AFTER_TIMEOUT'));
            return this.subscription;
        }
    }

    class SupabaseQueryBuilder extends PostgrestQueryBuilder {
        constructor(url, { headers = {}, schema, realtime, table, }) {
            super(url, { headers, schema });
            this._subscription = new SupabaseRealtimeClient(realtime, schema, table);
            this._realtime = realtime;
        }
        /**
         * Subscribe to realtime changes in your databse.
         * @param event The database event which you would like to receive updates for, or you can use the special wildcard `*` to listen to all changes.
         * @param callback A callback that will handle the payload that is sent whenever your database changes.
         */
        on(event, callback) {
            if (!this._realtime.isConnected()) {
                this._realtime.connect();
            }
            return this._subscription.on(event, callback);
        }
    }

    var __awaiter$5 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const _getErrorMessage$1 = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
    const handleError$1 = (error, reject) => {
        if (typeof error.json !== 'function') {
            return reject(error);
        }
        error.json().then((err) => {
            return reject({
                message: _getErrorMessage$1(err),
                status: (error === null || error === void 0 ? void 0 : error.status) || 500,
            });
        });
    };
    const _getRequestParams$1 = (method, options, parameters, body) => {
        const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
        if (method === 'GET') {
            return params;
        }
        params.headers = Object.assign({ 'Content-Type': 'application/json' }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
        return Object.assign(Object.assign({}, params), parameters);
    };
    function _handleRequest$1(method, url, options, parameters, body) {
        return __awaiter$5(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fetch(url, _getRequestParams$1(method, options, parameters, body))
                    .then((result) => {
                    if (!result.ok)
                        throw result;
                    if (options === null || options === void 0 ? void 0 : options.noResolveJson)
                        return resolve(result);
                    return result.json();
                })
                    .then((data) => resolve(data))
                    .catch((error) => handleError$1(error, reject));
            });
        });
    }
    function get$1(url, options, parameters) {
        return __awaiter$5(this, void 0, void 0, function* () {
            return _handleRequest$1('GET', url, options, parameters);
        });
    }
    function post$1(url, body, options, parameters) {
        return __awaiter$5(this, void 0, void 0, function* () {
            return _handleRequest$1('POST', url, options, parameters, body);
        });
    }
    function put$1(url, body, options, parameters) {
        return __awaiter$5(this, void 0, void 0, function* () {
            return _handleRequest$1('PUT', url, options, parameters, body);
        });
    }
    function remove$1(url, body, options, parameters) {
        return __awaiter$5(this, void 0, void 0, function* () {
            return _handleRequest$1('DELETE', url, options, parameters, body);
        });
    }

    // generated by genversion
    const version$5 = '0.0.0';

    const DEFAULT_HEADERS$4 = { 'X-Client-Info': `storage-js/${version$5}` };

    var __awaiter$6 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    class StorageBucketApi {
        constructor(url, headers = {}) {
            this.url = url;
            this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$4), headers);
        }
        /**
         * Retrieves the details of all Storage buckets within an existing product.
         */
        listBuckets() {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const data = yield get$1(`${this.url}/bucket`, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Retrieves the details of an existing Storage bucket.
         *
         * @param id The unique identifier of the bucket you would like to retrieve.
         */
        getBucket(id) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const data = yield get$1(`${this.url}/bucket/${id}`, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Creates a new Storage bucket
         *
         * @param id A unique identifier for the bucket you are creating.
         * @returns newly created bucket id
         */
        createBucket(id, options = { public: false }) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const data = yield post$1(`${this.url}/bucket`, { id, name: id, public: options.public }, { headers: this.headers });
                    return { data: data.name, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Updates a new Storage bucket
         *
         * @param id A unique identifier for the bucket you are creating.
         */
        updateBucket(id, options) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const data = yield put$1(`${this.url}/bucket/${id}`, { id, name: id, public: options.public }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Removes all objects inside a single bucket.
         *
         * @param id The unique identifier of the bucket you would like to empty.
         */
        emptyBucket(id) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const data = yield post$1(`${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
         * You must first `empty()` the bucket.
         *
         * @param id The unique identifier of the bucket you would like to delete.
         */
        deleteBucket(id) {
            return __awaiter$6(this, void 0, void 0, function* () {
                try {
                    const data = yield remove$1(`${this.url}/bucket/${id}`, {}, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
    }

    var __awaiter$7 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const DEFAULT_SEARCH_OPTIONS = {
        limit: 100,
        offset: 0,
        sortBy: {
            column: 'name',
            order: 'asc',
        },
    };
    const DEFAULT_FILE_OPTIONS = {
        cacheControl: '3600',
        contentType: 'text/plain;charset=UTF-8',
        upsert: false,
    };
    class StorageFileApi {
        constructor(url, headers = {}, bucketId) {
            this.url = url;
            this.headers = headers;
            this.bucketId = bucketId;
        }
        /**
         * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
         *
         * @param method HTTP method.
         * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param fileBody The body of the file to be stored in the bucket.
         * @param fileOptions HTTP headers.
         * `cacheControl`: string, the `Cache-Control: max-age=<seconds>` seconds value.
         * `contentType`: string, the `Content-Type` header value. Should be specified if using a `fileBody` that is neither `Blob` nor `File` nor `FormData`, otherwise will default to `text/plain;charset=UTF-8`.
         * `upsert`: boolean, whether to perform an upsert.
         */
        uploadOrUpdate(method, path, fileBody, fileOptions) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    let body;
                    const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
                    const headers = Object.assign(Object.assign({}, this.headers), (method === 'POST' && { 'x-upsert': String(options.upsert) }));
                    if (typeof Blob !== 'undefined' && fileBody instanceof Blob) {
                        body = new FormData();
                        body.append('cacheControl', options.cacheControl);
                        body.append('', fileBody);
                    }
                    else if (typeof FormData !== 'undefined' && fileBody instanceof FormData) {
                        body = fileBody;
                        body.append('cacheControl', options.cacheControl);
                    }
                    else {
                        body = fileBody;
                        headers['cache-control'] = `max-age=${options.cacheControl}`;
                        headers['content-type'] = options.contentType;
                    }
                    const _path = this._getFinalPath(path);
                    const res = yield fetch(`${this.url}/object/${_path}`, {
                        method,
                        body: body,
                        headers,
                    });
                    if (res.ok) {
                        // const data = await res.json()
                        // temporary fix till backend is updated to the latest storage-api version
                        return { data: { Key: _path }, error: null };
                    }
                    else {
                        const error = yield res.json();
                        return { data: null, error };
                    }
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Uploads a file to an existing bucket.
         *
         * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param fileBody The body of the file to be stored in the bucket.
         * @param fileOptions HTTP headers.
         * `cacheControl`: string, the `Cache-Control: max-age=<seconds>` seconds value.
         * `contentType`: string, the `Content-Type` header value. Should be specified if using a `fileBody` that is neither `Blob` nor `File` nor `FormData`, otherwise will default to `text/plain;charset=UTF-8`.
         * `upsert`: boolean, whether to perform an upsert.
         */
        upload(path, fileBody, fileOptions) {
            return __awaiter$7(this, void 0, void 0, function* () {
                return this.uploadOrUpdate('POST', path, fileBody, fileOptions);
            });
        }
        /**
         * Replaces an existing file at the specified path with a new one.
         *
         * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
         * @param fileBody The body of the file to be stored in the bucket.
         * @param fileOptions HTTP headers.
         * `cacheControl`: string, the `Cache-Control: max-age=<seconds>` seconds value.
         * `contentType`: string, the `Content-Type` header value. Should be specified if using a `fileBody` that is neither `Blob` nor `File` nor `FormData`, otherwise will default to `text/plain;charset=UTF-8`.
         * `upsert`: boolean, whether to perform an upsert.
         */
        update(path, fileBody, fileOptions) {
            return __awaiter$7(this, void 0, void 0, function* () {
                return this.uploadOrUpdate('PUT', path, fileBody, fileOptions);
            });
        }
        /**
         * Moves an existing file, optionally renaming it at the same time.
         *
         * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
         * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
         */
        move(fromPath, toPath) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield post$1(`${this.url}/object/move`, { bucketId: this.bucketId, sourceKey: fromPath, destinationKey: toPath }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Create signed url to download file without requiring permissions. This URL can be valid for a set number of seconds.
         *
         * @param path The file path to be downloaded, including the current file name. For example `folder/image.png`.
         * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
         */
        createSignedUrl(path, expiresIn) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const _path = this._getFinalPath(path);
                    let data = yield post$1(`${this.url}/object/sign/${_path}`, { expiresIn }, { headers: this.headers });
                    const signedURL = `${this.url}${data.signedURL}`;
                    data = { signedURL };
                    return { data, error: null, signedURL };
                }
                catch (error) {
                    return { data: null, error, signedURL: null };
                }
            });
        }
        /**
         * Downloads a file.
         *
         * @param path The file path to be downloaded, including the path and file name. For example `folder/image.png`.
         */
        download(path) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const _path = this._getFinalPath(path);
                    const res = yield get$1(`${this.url}/object/${_path}`, {
                        headers: this.headers,
                        noResolveJson: true,
                    });
                    const data = yield res.blob();
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Retrieve URLs for assets in public buckets
         *
         * @param path The file path to be downloaded, including the path and file name. For example `folder/image.png`.
         */
        getPublicUrl(path) {
            try {
                const _path = this._getFinalPath(path);
                const publicURL = `${this.url}/object/public/${_path}`;
                const data = { publicURL };
                return { data, error: null, publicURL };
            }
            catch (error) {
                return { data: null, error, publicURL: null };
            }
        }
        /**
         * Deletes files within the same bucket
         *
         * @param paths An array of files to be deletes, including the path and file name. For example [`folder/image.png`].
         */
        remove(paths) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const data = yield remove$1(`${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        /**
         * Get file metadata
         * @param id the file id to retrieve metadata
         */
        // async getMetadata(id: string): Promise<{ data: Metadata | null; error: Error | null }> {
        //   try {
        //     const data = await get(`${this.url}/metadata/${id}`, { headers: this.headers })
        //     return { data, error: null }
        //   } catch (error) {
        //     return { data: null, error }
        //   }
        // }
        /**
         * Update file metadata
         * @param id the file id to update metadata
         * @param meta the new file metadata
         */
        // async updateMetadata(
        //   id: string,
        //   meta: Metadata
        // ): Promise<{ data: Metadata | null; error: Error | null }> {
        //   try {
        //     const data = await post(`${this.url}/metadata/${id}`, { ...meta }, { headers: this.headers })
        //     return { data, error: null }
        //   } catch (error) {
        //     return { data: null, error }
        //   }
        // }
        /**
         * Lists all the files within a bucket.
         * @param path The folder path.
         * @param options Search options, including `limit`, `offset`, and `sortBy`.
         * @param parameters Fetch parameters, currently only supports `signal`, which is an AbortController's signal
         */
        list(path, options, parameters) {
            return __awaiter$7(this, void 0, void 0, function* () {
                try {
                    const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options), { prefix: path || '' });
                    const data = yield post$1(`${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
                    return { data, error: null };
                }
                catch (error) {
                    return { data: null, error };
                }
            });
        }
        _getFinalPath(path) {
            return `${this.bucketId}/${path}`;
        }
    }

    class SupabaseStorageClient extends StorageBucketApi {
        constructor(url, headers = {}) {
            super(url, headers);
        }
        /**
         * Perform file operation in a bucket.
         *
         * @param id The bucket id to operate on.
         */
        from(id) {
            return new StorageFileApi(this.url, this.headers, id);
        }
    }

    var __awaiter$8 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const DEFAULT_OPTIONS$1 = {
        schema: 'public',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        localStorage: globalThis.localStorage,
        headers: DEFAULT_HEADERS,
    };
    /**
     * Supabase Client.
     *
     * An isomorphic Javascript client for interacting with Postgres.
     */
    class SupabaseClient {
        /**
         * Create a new client for use in the browser.
         * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
         * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
         * @param options.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
         * @param options.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
         * @param options.persistSession Set to "true" if you want to automatically save the user session into local storage.
         * @param options.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
         * @param options.headers Any additional headers to send with each network request.
         * @param options.realtime Options passed along to realtime-js constructor.
         */
        constructor(supabaseUrl, supabaseKey, options) {
            this.supabaseUrl = supabaseUrl;
            this.supabaseKey = supabaseKey;
            if (!supabaseUrl)
                throw new Error('supabaseUrl is required.');
            if (!supabaseKey)
                throw new Error('supabaseKey is required.');
            const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS$1), options);
            this.restUrl = `${supabaseUrl}/rest/v1`;
            this.realtimeUrl = `${supabaseUrl}/realtime/v1`.replace('http', 'ws');
            this.authUrl = `${supabaseUrl}/auth/v1`;
            this.storageUrl = `${supabaseUrl}/storage/v1`;
            this.schema = settings.schema;
            this.auth = this._initSupabaseAuthClient(settings);
            this.realtime = this._initRealtimeClient(settings.realtime);
            // In the future we might allow the user to pass in a logger to receive these events.
            // this.realtime.onOpen(() => console.log('OPEN'))
            // this.realtime.onClose(() => console.log('CLOSED'))
            // this.realtime.onError((e: Error) => console.log('Socket error', e))
        }
        /**
         * Supabase Storage allows you to manage user-generated content, such as photos or videos.
         */
        get storage() {
            return new SupabaseStorageClient(this.storageUrl, this._getAuthHeaders());
        }
        /**
         * Perform a table operation.
         *
         * @param table The table name to operate on.
         */
        from(table) {
            const url = `${this.restUrl}/${table}`;
            return new SupabaseQueryBuilder(url, {
                headers: this._getAuthHeaders(),
                schema: this.schema,
                realtime: this.realtime,
                table,
            });
        }
        /**
         * Perform a function call.
         *
         * @param fn  The function name to call.
         * @param params  The parameters to pass to the function call.
         * @param count  Count algorithm to use to count rows in a table.
         *
         */
        rpc(fn, params, { count = null } = {}) {
            const rest = this._initPostgRESTClient();
            return rest.rpc(fn, params, { count });
        }
        /**
         * Removes an active subscription and returns the number of open connections.
         *
         * @param subscription The subscription you want to remove.
         */
        removeSubscription(subscription) {
            return new Promise((resolve) => __awaiter$8(this, void 0, void 0, function* () {
                try {
                    yield this._closeSubscription(subscription);
                    const openSubscriptions = this.getSubscriptions().length;
                    if (!openSubscriptions) {
                        const { error } = yield this.realtime.disconnect();
                        if (error)
                            return resolve({ error });
                    }
                    return resolve({ error: null, data: { openSubscriptions } });
                }
                catch (error) {
                    return resolve({ error });
                }
            }));
        }
        _closeSubscription(subscription) {
            return __awaiter$8(this, void 0, void 0, function* () {
                if (!subscription.isClosed()) {
                    yield this._closeChannel(subscription);
                }
            });
        }
        /**
         * Returns an array of all your subscriptions.
         */
        getSubscriptions() {
            return this.realtime.channels;
        }
        _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, localStorage, headers, }) {
            const authHeaders = {
                Authorization: `Bearer ${this.supabaseKey}`,
                apikey: `${this.supabaseKey}`,
            };
            return new SupabaseAuthClient({
                url: this.authUrl,
                headers: Object.assign(Object.assign({}, headers), authHeaders),
                autoRefreshToken,
                persistSession,
                detectSessionInUrl,
                localStorage,
            });
        }
        _initRealtimeClient(options) {
            return new RealtimeClient(this.realtimeUrl, Object.assign(Object.assign({}, options), { params: Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.params), { apikey: this.supabaseKey }) }));
        }
        _initPostgRESTClient() {
            return new PostgrestClient(this.restUrl, {
                headers: this._getAuthHeaders(),
                schema: this.schema,
            });
        }
        _getAuthHeaders() {
            var _a, _b;
            const headers = {};
            const authBearer = (_b = (_a = this.auth.session()) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : this.supabaseKey;
            headers['apikey'] = this.supabaseKey;
            headers['Authorization'] = `Bearer ${authBearer}`;
            return headers;
        }
        _closeChannel(subscription) {
            return new Promise((resolve, reject) => {
                subscription
                    .unsubscribe()
                    .receive('ok', () => {
                    this.realtime.remove(subscription);
                    return resolve(true);
                })
                    .receive('error', (e) => reject(e));
            });
        }
    }

    /**
     * Creates a new Supabase Client.
     */
    const createClient = (supabaseUrl, supabaseKey, options) => {
        return new SupabaseClient(supabaseUrl, supabaseKey, options);
    };

    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMDE0MzIwMSwiZXhwIjoxOTQ1NzE5MjAxfQ.CsonEZq7BbELLr2Jvqtv985ZiEFbzidGBCEfEtEk2L0';

    const supabaseUrl = 'https://glkylfhlgbxdibbqaqyg.supabase.co';
    const supabase = createClient(supabaseUrl, SUPABASE_KEY);

    /* src/AddData.svelte generated by Svelte v3.31.2 */

    const { console: console_1 } = globals;
    const file$e = "src/AddData.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[62] = list[i].answer_title;
    	child_ctx[63] = list[i].is_correct;
    	child_ctx[65] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	child_ctx[65] = i;
    	return child_ctx;
    }

    function get_then_context(ctx) {
    	ctx[58] = ctx[67].data;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[68] = list[i];
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[59] = list[i];
    	return child_ctx;
    }

    function get_each_context_5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[73] = list[i];
    	return child_ctx;
    }

    // (433:8) {:else}
    function create_else_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No tags in database!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(433:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (426:8) {#each tagsFromDB as tag}
    function create_each_block_5(ctx) {
    	let div;
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*tag*/ ctx[73] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			input.__value = input_value_value = /*tag*/ ctx[73];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[29][0].push(input);
    			add_location(input, file$e, 428, 14, 11889);
    			attr_dev(label, "class", "checkbox");
    			add_location(label, file$e, 427, 12, 11850);
    			attr_dev(div, "class", "column is-6");
    			add_location(div, file$e, 426, 10, 11812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, input);
    			input.checked = ~/*tags*/ ctx[4].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[28]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tagsFromDB*/ 262144 && input_value_value !== (input_value_value = /*tag*/ ctx[73])) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty[0] & /*tags*/ 16) {
    				input.checked = ~/*tags*/ ctx[4].indexOf(input.__value);
    			}

    			if (dirty[0] & /*tagsFromDB*/ 262144 && t1_value !== (t1_value = /*tag*/ ctx[73] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*$$binding_groups*/ ctx[29][0].splice(/*$$binding_groups*/ ctx[29][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_5.name,
    		type: "each",
    		source: "(426:8) {#each tagsFromDB as tag}",
    		ctx
    	});

    	return block;
    }

    // (437:6) <Button type="is-dark" on:click={() => (isModalActive = false)}>
    function create_default_slot_30(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Okay");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_30.name,
    		type: "slot",
    		source: "(437:6) <Button type=\\\"is-dark\\\" on:click={() => (isModalActive = false)}>",
    		ctx
    	});

    	return block;
    }

    // (440:6) <Button         on:click={() => {           tags = [];         }}       >
    function create_default_slot_29(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Reset");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_29.name,
    		type: "slot",
    		source: "(440:6) <Button         on:click={() => {           tags = [];         }}       >",
    		ctx
    	});

    	return block;
    }

    // (417:0) <Modal bind:active={isModalActive}>
    function create_default_slot_28(ctx) {
    	let div0;
    	let t0;
    	let div2;
    	let header;
    	let p0;
    	let t2;
    	let section;
    	let div1;
    	let t3;
    	let footer;
    	let button0;
    	let t4;
    	let button1;
    	let t5;
    	let p1;
    	let t6;
    	let t7_value = /*tags*/ ctx[4].length + "";
    	let t7;
    	let t8;
    	let t9_value = (/*tags*/ ctx[4].length === 1 ? "tag" : "tags") + "";
    	let t9;
    	let current;
    	let each_value_5 = /*tagsFromDB*/ ctx[18];
    	validate_each_argument(each_value_5);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_5.length; i += 1) {
    		each_blocks[i] = create_each_block_5(get_each_context_5(ctx, each_value_5, i));
    	}

    	let each_1_else = null;

    	if (!each_value_5.length) {
    		each_1_else = create_else_block_3(ctx);
    	}

    	button0 = new Button({
    			props: {
    				type: "is-dark",
    				$$slots: { default: [create_default_slot_30] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[30]);

    	button1 = new Button({
    			props: {
    				$$slots: { default: [create_default_slot_29] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[31]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			header = element("header");
    			p0 = element("p");
    			p0.textContent = "Select Tags";
    			t2 = space();
    			section = element("section");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			t3 = space();
    			footer = element("footer");
    			create_component(button0.$$.fragment);
    			t4 = space();
    			create_component(button1.$$.fragment);
    			t5 = space();
    			p1 = element("p");
    			t6 = text("You're select ");
    			t7 = text(t7_value);
    			t8 = space();
    			t9 = text(t9_value);
    			attr_dev(div0, "class", "modal-background");
    			add_location(div0, file$e, 417, 2, 11501);
    			attr_dev(p0, "class", "modal-card-title");
    			add_location(p0, file$e, 420, 6, 11604);
    			attr_dev(header, "class", "modal-card-head");
    			add_location(header, file$e, 419, 4, 11565);
    			attr_dev(div1, "class", "columns is-multiline");
    			add_location(div1, file$e, 424, 6, 11733);
    			attr_dev(section, "class", "modal-card-body");
    			add_location(section, file$e, 422, 4, 11666);
    			add_location(p1, file$e, 446, 6, 12327);
    			attr_dev(footer, "class", "modal-card-foot");
    			add_location(footer, file$e, 435, 4, 12078);
    			attr_dev(div2, "class", "modal-card");
    			add_location(div2, file$e, 418, 2, 11536);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, header);
    			append_dev(header, p0);
    			append_dev(div2, t2);
    			append_dev(div2, section);
    			append_dev(section, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div1, null);
    			}

    			append_dev(div2, t3);
    			append_dev(div2, footer);
    			mount_component(button0, footer, null);
    			append_dev(footer, t4);
    			mount_component(button1, footer, null);
    			append_dev(footer, t5);
    			append_dev(footer, p1);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tagsFromDB, tags*/ 262160) {
    				each_value_5 = /*tagsFromDB*/ ctx[18];
    				validate_each_argument(each_value_5);
    				let i;

    				for (i = 0; i < each_value_5.length; i += 1) {
    					const child_ctx = get_each_context_5(ctx, each_value_5, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_5.length;

    				if (each_value_5.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block_3(ctx);
    					each_1_else.c();
    					each_1_else.m(div1, null);
    				}
    			}

    			const button0_changes = {};

    			if (dirty[2] & /*$$scope*/ 16384) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty[2] & /*$$scope*/ 16384) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			if ((!current || dirty[0] & /*tags*/ 16) && t7_value !== (t7_value = /*tags*/ ctx[4].length + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty[0] & /*tags*/ 16) && t9_value !== (t9_value = (/*tags*/ ctx[4].length === 1 ? "tag" : "tags") + "")) set_data_dev(t9, t9_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_28.name,
    		type: "slot",
    		source: "(417:0) <Modal bind:active={isModalActive}>",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import {     Field,     Input,     Switch,     Tag,     Taglist,     Button,     Icon,     Select,     Notification,     Modal,   }
    function create_catch_block_2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_2.name,
    		type: "catch",
    		source: "(1:0) <script>   import {     Field,     Input,     Switch,     Tag,     Taglist,     Button,     Icon,     Select,     Notification,     Modal,   }",
    		ctx
    	});

    	return block;
    }

    // (468:43)            {#each data as item}
    function create_then_block_2(ctx) {
    	let each_1_anchor;
    	let each_value_4 = /*data*/ ctx[58];
    	validate_each_argument(each_value_4);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*loadCategories*/ 134217728) {
    				each_value_4 = /*data*/ ctx[58];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_4.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_2.name,
    		type: "then",
    		source: "(468:43)            {#each data as item}",
    		ctx
    	});

    	return block;
    }

    // (469:10) {#each data as item}
    function create_each_block_4(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[59].category_name + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			attr_dev(option, "class", "is-capitalized");

    			option.__value = {
    				category_id: /*item*/ ctx[59].category_id,
    				category_name: /*item*/ ctx[59].category_name
    			};

    			option.value = option.__value;
    			add_location(option, file$e, 469, 12, 12898);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(469:10) {#each data as item}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import {     Field,     Input,     Switch,     Tag,     Taglist,     Button,     Icon,     Select,     Notification,     Modal,   }
    function create_pending_block_2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_2.name,
    		type: "pending",
    		source: "(1:0) <script>   import {     Field,     Input,     Switch,     Tag,     Taglist,     Button,     Icon,     Select,     Notification,     Modal,   }",
    		ctx
    	});

    	return block;
    }

    // (462:6) <Select         placeholder="chose category"         bind:selected={tmp_test_category}         expanded         loading={isLoadingCategory}       >
    function create_default_slot_27(ctx) {
    	let t0;
    	let option;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_2,
    		then: create_then_block_2,
    		catch: create_catch_block_2,
    		value: 58
    	};

    	handle_promise(/*loadCategories*/ ctx[27](), info);

    	const block = {
    		c: function create() {
    			info.block.c();
    			t0 = space();
    			option = element("option");
    			option.textContent = "Null";
    			option.__value = { category_id: null, category_name: null };
    			option.value = option.__value;
    			add_location(option, file$e, 478, 8, 13167);
    		},
    		m: function mount(target, anchor) {
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t0.parentNode;
    			info.anchor = t0;
    			insert_dev(target, t0, anchor);
    			insert_dev(target, option, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[58] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_27.name,
    		type: "slot",
    		source: "(462:6) <Select         placeholder=\\\"chose category\\\"         bind:selected={tmp_test_category}         expanded         loading={isLoadingCategory}       >",
    		ctx
    	});

    	return block;
    }

    // (461:4) <Field>
    function create_default_slot_26(ctx) {
    	let select;
    	let updating_selected;
    	let current;

    	function select_selected_binding(value) {
    		/*select_selected_binding*/ ctx[33].call(null, value);
    	}

    	let select_props = {
    		placeholder: "chose category",
    		expanded: true,
    		loading: /*isLoadingCategory*/ ctx[9],
    		$$slots: { default: [create_default_slot_27] },
    		$$scope: { ctx }
    	};

    	if (/*tmp_test_category*/ ctx[0] !== void 0) {
    		select_props.selected = /*tmp_test_category*/ ctx[0];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "selected", select_selected_binding));

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty[0] & /*isLoadingCategory*/ 512) select_changes.loading = /*isLoadingCategory*/ ctx[9];

    			if (dirty[2] & /*$$scope*/ 16384) {
    				select_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_selected && dirty[0] & /*tmp_test_category*/ 1) {
    				updating_selected = true;
    				select_changes.selected = /*tmp_test_category*/ ctx[0];
    				add_flush_callback(() => updating_selected = false);
    			}

    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_26.name,
    		type: "slot",
    		source: "(461:4) <Field>",
    		ctx
    	});

    	return block;
    }

    // (488:4) <Button       type="is-dark block"       on:click={generateCorrectTestTitle(         tmp_test_category.category_id,         tmp_test_category.category_name       )}       loading={isLoadingGenerateID}       disabled={!tmp_test_category.category_id}     >
    function create_default_slot_25(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Generate Unique Title!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_25.name,
    		type: "slot",
    		source: "(488:4) <Button       type=\\\"is-dark block\\\"       on:click={generateCorrectTestTitle(         tmp_test_category.category_id,         tmp_test_category.category_name       )}       loading={isLoadingGenerateID}       disabled={!tmp_test_category.category_id}     >",
    		ctx
    	});

    	return block;
    }

    // (501:4) <Field label="test title">
    function create_default_slot_24(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[34].call(null, value);
    	}

    	let input_props = {
    		placeholder: "add a title of test here 🤪",
    		icon: "dove"
    	};

    	if (/*test*/ ctx[2].test_title !== void 0) {
    		input_props.value = /*test*/ ctx[2].test_title;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty[0] & /*test*/ 4) {
    				updating_value = true;
    				input_changes.value = /*test*/ ctx[2].test_title;
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_24.name,
    		type: "slot",
    		source: "(501:4) <Field label=\\\"test title\\\">",
    		ctx
    	});

    	return block;
    }

    // (509:4) <Field label="test description">
    function create_default_slot_23(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding_1(value) {
    		/*input_value_binding_1*/ ctx[35].call(null, value);
    	}

    	let input_props = {
    		placeholder: "add a description of test here, don't write so mush 🙄",
    		type: "textarea",
    		maxlength: "1000"
    	};

    	if (/*test*/ ctx[2].test_description !== void 0) {
    		input_props.value = /*test*/ ctx[2].test_description;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding_1));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty[0] & /*test*/ 4) {
    				updating_value = true;
    				input_changes.value = /*test*/ ctx[2].test_description;
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_23.name,
    		type: "slot",
    		source: "(509:4) <Field label=\\\"test description\\\">",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import {     Field,     Input,     Switch,     Tag,     Taglist,     Button,     Icon,     Select,     Notification,     Modal,   }
    function create_catch_block_1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(1:0) <script>   import {     Field,     Input,     Switch,     Tag,     Taglist,     Button,     Icon,     Select,     Notification,     Modal,   }",
    		ctx
    	});

    	return block;
    }

    // (522:8) {:then { data }}
    function create_then_block_1(ctx) {
    	get_then_context(ctx);
    	let each_1_anchor;
    	let each_value_3 = /*data*/ ctx[58];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_1_else_1 = null;

    	if (!each_value_3.length) {
    		each_1_else_1 = create_else_block_2(ctx);
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();

    			if (each_1_else_1) {
    				each_1_else_1.c();
    			}
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (each_1_else_1) {
    				each_1_else_1.m(target, anchor);
    			}
    		},
    		p: function update(ctx, dirty) {
    			get_then_context(ctx);

    			if (dirty[0] & /*test*/ 4) {
    				each_value_3 = /*data*/ ctx[58];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;

    				if (each_value_3.length) {
    					if (each_1_else_1) {
    						each_1_else_1.d(1);
    						each_1_else_1 = null;
    					}
    				} else if (!each_1_else_1) {
    					each_1_else_1 = create_else_block_2(ctx);
    					each_1_else_1.c();
    					each_1_else_1.m(each_1_anchor.parentNode, each_1_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			if (each_1_else_1) each_1_else_1.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(522:8) {:then { data }}",
    		ctx
    	});

    	return block;
    }

    // (534:10) {:else}
    function create_else_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No difficulty in database!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(534:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (523:10) {#each data as d}
    function create_each_block_3(ctx) {
    	let div;
    	let label;
    	let t0_value = /*d*/ ctx[68].difficulty_id + "";
    	let t0;
    	let t1;
    	let input;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			attr_dev(label, "for", /*d*/ ctx[68].difficulty_id);
    			add_location(label, file$e, 524, 14, 14416);
    			attr_dev(input, "id", /*d*/ ctx[68].difficulty_id);
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "name", "difficulty");
    			input.__value = /*d*/ ctx[68].difficulty_id;
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[29][1].push(input);
    			add_location(input, file$e, 525, 14, 14485);
    			attr_dev(div, "class", "column");
    			add_location(div, file$e, 523, 12, 14381);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(div, t1);
    			append_dev(div, input);
    			input.checked = input.__value === /*test*/ ctx[2].difficulty_id;
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler_1*/ ctx[36]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*test*/ 4) {
    				input.checked = input.__value === /*test*/ ctx[2].difficulty_id;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*$$binding_groups*/ ctx[29][1].splice(/*$$binding_groups*/ ctx[29][1].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(523:10) {#each data as d}",
    		ctx
    	});

    	return block;
    }

    // (520:68)            Loading difficulty ...         {:then { data }}
    function create_pending_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Loading difficulty ...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(520:68)            Loading difficulty ...         {:then { data }}",
    		ctx
    	});

    	return block;
    }

    // (518:4) <Field label="difficulty">
    function create_default_slot_22(ctx) {
    	let div;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block_1,
    		value: 67
    	};

    	handle_promise(supabase.from("difficulty").select("difficulty_id"), info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "class", "columns is-multiline");
    			add_location(div, file$e, 518, 6, 14179);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[67] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_22.name,
    		type: "slot",
    		source: "(518:4) <Field label=\\\"difficulty\\\">",
    		ctx
    	});

    	return block;
    }

    // (539:4) <Field label="Score To Pass">
    function create_default_slot_21(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding_2(value) {
    		/*input_value_binding_2*/ ctx[37].call(null, value);
    	}

    	let input_props = {
    		placeholder: "add a number value > 0 🐿",
    		type: "number",
    		max: "1000",
    		min: "1"
    	};

    	if (/*test*/ ctx[2].score_to_pass !== void 0) {
    		input_props.value = /*test*/ ctx[2].score_to_pass;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding_2));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty[0] & /*test*/ 4) {
    				updating_value = true;
    				input_changes.value = /*test*/ ctx[2].score_to_pass;
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_21.name,
    		type: "slot",
    		source: "(539:4) <Field label=\\\"Score To Pass\\\">",
    		ctx
    	});

    	return block;
    }

    // (550:6) <Switch bind:checked={tmp_status}>
    function create_default_slot_20(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("is private 🤴?");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_20.name,
    		type: "slot",
    		source: "(550:6) <Switch bind:checked={tmp_status}>",
    		ctx
    	});

    	return block;
    }

    // (553:4) <Button       type="is-dark is-fullwidth"       on:click={(e) => addTest()}       loading={isLoadingTest}       expanded     >
    function create_default_slot_19(ctx) {
    	let icon;
    	let current;
    	icon = new Icon({ props: { icon: "plus" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_19.name,
    		type: "slot",
    		source: "(553:4) <Button       type=\\\"is-dark is-fullwidth\\\"       on:click={(e) => addTest()}       loading={isLoadingTest}       expanded     >",
    		ctx
    	});

    	return block;
    }

    // (562:4) <Notification       icon={true}       type={notificationTest.type}       bind:active={notificationTest.showUp}     >
    function create_default_slot_18(ctx) {
    	let t_value = /*notificationTest*/ ctx[15].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*notificationTest*/ 32768 && t_value !== (t_value = /*notificationTest*/ ctx[15].message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_18.name,
    		type: "slot",
    		source: "(562:4) <Notification       icon={true}       type={notificationTest.type}       bind:active={notificationTest.showUp}     >",
    		ctx
    	});

    	return block;
    }

    // (574:4) <Field label="question">
    function create_default_slot_17(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding_3(value) {
    		/*input_value_binding_3*/ ctx[41].call(null, value);
    	}

    	let input_props = {
    		placeholder: "add a question title here, be criative 😎",
    		icon: "dragon"
    	};

    	if (/*question*/ ctx[1].question_title !== void 0) {
    		input_props.value = /*question*/ ctx[1].question_title;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding_3));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty[0] & /*question*/ 2) {
    				updating_value = true;
    				input_changes.value = /*question*/ ctx[1].question_title;
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_17.name,
    		type: "slot",
    		source: "(574:4) <Field label=\\\"question\\\">",
    		ctx
    	});

    	return block;
    }

    // (582:4) <Field label="hint">
    function create_default_slot_16(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding_4(value) {
    		/*input_value_binding_4*/ ctx[42].call(null, value);
    	}

    	let input_props = {
    		placeholder: "add a hint (to help user) here, 👌",
    		type: "text",
    		maxlength: "1000"
    	};

    	if (/*question*/ ctx[1].question_hint !== void 0) {
    		input_props.value = /*question*/ ctx[1].question_hint;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding_4));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty[0] & /*question*/ 2) {
    				updating_value = true;
    				input_changes.value = /*question*/ ctx[1].question_hint;
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_16.name,
    		type: "slot",
    		source: "(582:4) <Field label=\\\"hint\\\">",
    		ctx
    	});

    	return block;
    }

    // (591:4) <Field label="Point">
    function create_default_slot_15(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding_5(value) {
    		/*input_value_binding_5*/ ctx[43].call(null, value);
    	}

    	let input_props = {
    		placeholder: "add a point here, 👌",
    		type: "number"
    	};

    	if (/*question*/ ctx[1].question_point !== void 0) {
    		input_props.value = /*question*/ ctx[1].question_point;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding_5));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty[0] & /*question*/ 2) {
    				updating_value = true;
    				input_changes.value = /*question*/ ctx[1].question_point;
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_15.name,
    		type: "slot",
    		source: "(591:4) <Field label=\\\"Point\\\">",
    		ctx
    	});

    	return block;
    }

    // (599:4) <Field label="correction">
    function create_default_slot_14(ctx) {
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding_6(value) {
    		/*input_value_binding_6*/ ctx[44].call(null, value);
    	}

    	let input_props = {
    		placeholder: "add a question correction (the real answer) here, 👌",
    		type: "textarea",
    		maxlength: "1000",
    		size: "is-small"
    	};

    	if (/*question*/ ctx[1].question_correction !== void 0) {
    		input_props.value = /*question*/ ctx[1].question_correction;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding_6));

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty[0] & /*question*/ 2) {
    				updating_value = true;
    				input_changes.value = /*question*/ ctx[1].question_correction;
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_14.name,
    		type: "slot",
    		source: "(599:4) <Field label=\\\"correction\\\">",
    		ctx
    	});

    	return block;
    }

    // (610:4) <Button       expanded       type="is-dark"       on:click={() => loadTags({ showModal: true })}       loading={isLoadingTags}     >
    function create_default_slot_13(ctx) {
    	let icon;
    	let current;
    	icon = new Icon({ props: { icon: "fire" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(610:4) <Button       expanded       type=\\\"is-dark\\\"       on:click={() => loadTags({ showModal: true })}       loading={isLoadingTags}     >",
    		ctx
    	});

    	return block;
    }

    // (625:8) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No tags selected 😭!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(625:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (622:10) <Tag closable type="is-dark" on:close={(e) => deleteTag(i)}             >
    function create_default_slot_12(ctx) {
    	let t_value = /*item*/ ctx[59] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*tags*/ 16 && t_value !== (t_value = /*item*/ ctx[59] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(622:10) <Tag closable type=\\\"is-dark\\\" on:close={(e) => deleteTag(i)}             >",
    		ctx
    	});

    	return block;
    }

    // (621:8) {#each tags as item, i}
    function create_each_block_2(ctx) {
    	let tag;
    	let current;

    	function close_handler(...args) {
    		return /*close_handler*/ ctx[46](/*i*/ ctx[65], ...args);
    	}

    	tag = new Tag({
    			props: {
    				closable: true,
    				type: "is-dark",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tag.$on("close", close_handler);

    	const block = {
    		c: function create() {
    			create_component(tag.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tag, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tag_changes = {};

    			if (dirty[0] & /*tags*/ 16 | dirty[2] & /*$$scope*/ 16384) {
    				tag_changes.$$scope = { dirty, ctx };
    			}

    			tag.$set(tag_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tag.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tag.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tag, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(621:8) {#each tags as item, i}",
    		ctx
    	});

    	return block;
    }

    // (620:6) <Taglist>
    function create_default_slot_11(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_2 = /*tags*/ ctx[4];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else_2 = null;

    	if (!each_value_2.length) {
    		each_1_else_2 = create_else_block_1(ctx);
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();

    			if (each_1_else_2) {
    				each_1_else_2.c();
    			}
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (each_1_else_2) {
    				each_1_else_2.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*deleteTag, tags*/ 524304) {
    				each_value_2 = /*tags*/ ctx[4];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (each_value_2.length) {
    					if (each_1_else_2) {
    						each_1_else_2.d(1);
    						each_1_else_2 = null;
    					}
    				} else if (!each_1_else_2) {
    					each_1_else_2 = create_else_block_1(ctx);
    					each_1_else_2.c();
    					each_1_else_2.m(each_1_anchor.parentNode, each_1_anchor);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    			if (each_1_else_2) each_1_else_2.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(620:6) <Taglist>",
    		ctx
    	});

    	return block;
    }

    // (640:8) <Select placeholder="is correct?" bind:selected={tmp_answer.is_correct}>
    function create_default_slot_10(ctx) {
    	let option0;
    	let t1;
    	let option1;

    	const block = {
    		c: function create() {
    			option0 = element("option");
    			option0.textContent = "correct";
    			t1 = space();
    			option1 = element("option");
    			option1.textContent = "wrong";
    			option0.__value = true;
    			option0.value = option0.__value;
    			add_location(option0, file$e, 640, 10, 17573);
    			option1.__value = false;
    			option1.value = option1.__value;
    			add_location(option1, file$e, 641, 10, 17621);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, option1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(option1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(640:8) <Select placeholder=\\\"is correct?\\\" bind:selected={tmp_answer.is_correct}>",
    		ctx
    	});

    	return block;
    }

    // (646:8) <Button type="is-dark" on:click={(e) => addAnswer()}>
    function create_default_slot_9(ctx) {
    	let icon;
    	let current;
    	icon = new Icon({ props: { icon: "plus" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(646:8) <Button type=\\\"is-dark\\\" on:click={(e) => addAnswer()}>",
    		ctx
    	});

    	return block;
    }

    // (632:4) <Field>
    function create_default_slot_8(ctx) {
    	let input;
    	let updating_value;
    	let t0;
    	let p0;
    	let select;
    	let updating_selected;
    	let t1;
    	let p1;
    	let button;
    	let current;

    	function input_value_binding_7(value) {
    		/*input_value_binding_7*/ ctx[47].call(null, value);
    	}

    	let input_props = {
    		expanded: true,
    		placeholder: "Add an anwser here .. 🥰",
    		icon: "fish"
    	};

    	if (/*tmp_answer*/ ctx[7].answer_title !== void 0) {
    		input_props.value = /*tmp_answer*/ ctx[7].answer_title;
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding_7));

    	function select_selected_binding_1(value) {
    		/*select_selected_binding_1*/ ctx[48].call(null, value);
    	}

    	let select_props = {
    		placeholder: "is correct?",
    		$$slots: { default: [create_default_slot_10] },
    		$$scope: { ctx }
    	};

    	if (/*tmp_answer*/ ctx[7].is_correct !== void 0) {
    		select_props.selected = /*tmp_answer*/ ctx[7].is_correct;
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "selected", select_selected_binding_1));

    	button = new Button({
    			props: {
    				type: "is-dark",
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_4*/ ctx[49]);

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    			t0 = space();
    			p0 = element("p");
    			create_component(select.$$.fragment);
    			t1 = space();
    			p1 = element("p");
    			create_component(button.$$.fragment);
    			attr_dev(p0, "class", "control");
    			add_location(p0, file$e, 638, 6, 17462);
    			attr_dev(p1, "class", "control");
    			add_location(p1, file$e, 644, 6, 17693);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p0, anchor);
    			mount_component(select, p0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			mount_component(button, p1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty[0] & /*tmp_answer*/ 128) {
    				updating_value = true;
    				input_changes.value = /*tmp_answer*/ ctx[7].answer_title;
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    			const select_changes = {};

    			if (dirty[2] & /*$$scope*/ 16384) {
    				select_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_selected && dirty[0] & /*tmp_answer*/ 128) {
    				updating_selected = true;
    				select_changes.selected = /*tmp_answer*/ ctx[7].is_correct;
    				add_flush_callback(() => updating_selected = false);
    			}

    			select.$set(select_changes);
    			const button_changes = {};

    			if (dirty[2] & /*$$scope*/ 16384) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(select.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(select.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p0);
    			destroy_component(select);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(632:4) <Field>",
    		ctx
    	});

    	return block;
    }

    // (667:4) {:else}
    function create_else_block$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "No answers in this question 😭!";
    			attr_dev(div, "class", "notification");
    			add_location(div, file$e, 667, 6, 18414);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(667:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (655:10) <Button type="is-static">
    function create_default_slot_7(ctx) {
    	let t_value = /*i*/ ctx[65] + 1 + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(655:10) <Button type=\\\"is-static\\\">",
    		ctx
    	});

    	return block;
    }

    // (662:10) <Button type="is-danger" on:click={() => deleteAnswer(i)}>
    function create_default_slot_6(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { icon: "trash-alt" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(662:10) <Button type=\\\"is-danger\\\" on:click={() => deleteAnswer(i)}>",
    		ctx
    	});

    	return block;
    }

    // (653:6) <Field>
    function create_default_slot_5(ctx) {
    	let p0;
    	let button0;
    	let t0;
    	let input0;
    	let t1;
    	let p1;
    	let input1;
    	let t2;
    	let p2;
    	let button1;
    	let t3;
    	let current;

    	button0 = new Button({
    			props: {
    				type: "is-static",
    				$$slots: { default: [create_default_slot_7] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	input0 = new Input({
    			props: {
    				expanded: true,
    				readonly: true,
    				value: /*answer_title*/ ctx[62]
    			},
    			$$inline: true
    		});

    	input1 = new Input({
    			props: {
    				readonly: true,
    				value: /*is_correct*/ ctx[63] ? "correct 👍" : "wrong 👎"
    			},
    			$$inline: true
    		});

    	function click_handler_5() {
    		return /*click_handler_5*/ ctx[50](/*i*/ ctx[65]);
    	}

    	button1 = new Button({
    			props: {
    				type: "is-danger",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", click_handler_5);

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(input0.$$.fragment);
    			t1 = space();
    			p1 = element("p");
    			create_component(input1.$$.fragment);
    			t2 = space();
    			p2 = element("p");
    			create_component(button1.$$.fragment);
    			t3 = space();
    			attr_dev(p0, "class", "control");
    			add_location(p0, file$e, 653, 8, 17954);
    			attr_dev(p1, "class", "control");
    			add_location(p1, file$e, 657, 8, 18104);
    			attr_dev(p2, "class", "control");
    			add_location(p2, file$e, 660, 8, 18221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			mount_component(button0, p0, null);
    			insert_dev(target, t0, anchor);
    			mount_component(input0, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			mount_component(input1, p1, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, p2, anchor);
    			mount_component(button1, p2, null);
    			insert_dev(target, t3, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const button0_changes = {};

    			if (dirty[2] & /*$$scope*/ 16384) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const input0_changes = {};
    			if (dirty[0] & /*answers*/ 8) input0_changes.value = /*answer_title*/ ctx[62];
    			input0.$set(input0_changes);
    			const input1_changes = {};
    			if (dirty[0] & /*answers*/ 8) input1_changes.value = /*is_correct*/ ctx[63] ? "correct 👍" : "wrong 👎";
    			input1.$set(input1_changes);
    			const button1_changes = {};

    			if (dirty[2] & /*$$scope*/ 16384) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(input0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(input0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			destroy_component(button0);
    			if (detaching) detach_dev(t0);
    			destroy_component(input0, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			destroy_component(input1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(p2);
    			destroy_component(button1);
    			if (detaching) detach_dev(t3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(653:6) <Field>",
    		ctx
    	});

    	return block;
    }

    // (652:4) {#each answers as { answer_title, is_correct }
    function create_each_block_1(ctx) {
    	let field;
    	let current;

    	field = new Field({
    			props: {
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(field.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(field, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const field_changes = {};

    			if (dirty[0] & /*answers*/ 8 | dirty[2] & /*$$scope*/ 16384) {
    				field_changes.$$scope = { dirty, ctx };
    			}

    			field.$set(field_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(field, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(652:4) {#each answers as { answer_title, is_correct }",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import {     Field,     Input,     Switch,     Tag,     Taglist,     Button,     Icon,     Select,     Notification,     Modal,   }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   import {     Field,     Input,     Switch,     Tag,     Taglist,     Button,     Icon,     Select,     Notification,     Modal,   }",
    		ctx
    	});

    	return block;
    }

    // (680:45)            {#each data as item}
    function create_then_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[58];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*promiseLoadTestIDs*/ 131072) {
    				each_value = /*data*/ ctx[58];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(680:45)            {#each data as item}",
    		ctx
    	});

    	return block;
    }

    // (681:10) {#each data as item}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*item*/ ctx[59].test_title + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*item*/ ctx[59].test_id;
    			option.value = option.__value;
    			add_location(option, file$e, 681, 12, 18821);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*promiseLoadTestIDs*/ 131072 && t_value !== (t_value = /*item*/ ctx[59].test_title + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*promiseLoadTestIDs*/ 131072 && option_value_value !== (option_value_value = /*item*/ ctx[59].test_id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(681:10) {#each data as item}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import {     Field,     Input,     Switch,     Tag,     Taglist,     Button,     Icon,     Select,     Notification,     Modal,   }
    function create_pending_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>   import {     Field,     Input,     Switch,     Tag,     Taglist,     Button,     Icon,     Select,     Notification,     Modal,   }",
    		ctx
    	});

    	return block;
    }

    // (674:6) <Select         placeholder="chose one"         bind:selected={tmp_test_id}         expanded         loading={isLoadingTestParent}       >
    function create_default_slot_4(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 58
    	};

    	handle_promise(promise = /*promiseLoadTestIDs*/ ctx[17], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty[0] & /*promiseLoadTestIDs*/ 131072 && promise !== (promise = /*promiseLoadTestIDs*/ ctx[17]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[58] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(674:6) <Select         placeholder=\\\"chose one\\\"         bind:selected={tmp_test_id}         expanded         loading={isLoadingTestParent}       >",
    		ctx
    	});

    	return block;
    }

    // (687:8) <Button           type="is-dark"           on:click={(e) => (promiseLoadTestIDs = loadTestIDs())}         >
    function create_default_slot_3(ctx) {
    	let icon;
    	let current;
    	icon = new Icon({ props: { icon: "fire" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(687:8) <Button           type=\\\"is-dark\\\"           on:click={(e) => (promiseLoadTestIDs = loadTestIDs())}         >",
    		ctx
    	});

    	return block;
    }

    // (673:4) <Field>
    function create_default_slot_2(ctx) {
    	let select;
    	let updating_selected;
    	let t;
    	let p;
    	let button;
    	let current;

    	function select_selected_binding_2(value) {
    		/*select_selected_binding_2*/ ctx[51].call(null, value);
    	}

    	let select_props = {
    		placeholder: "chose one",
    		expanded: true,
    		loading: /*isLoadingTestParent*/ ctx[11],
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	};

    	if (/*tmp_test_id*/ ctx[5] !== void 0) {
    		select_props.selected = /*tmp_test_id*/ ctx[5];
    	}

    	select = new Select({ props: select_props, $$inline: true });
    	binding_callbacks.push(() => bind(select, "selected", select_selected_binding_2));

    	button = new Button({
    			props: {
    				type: "is-dark",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler_6*/ ctx[52]);

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    			t = space();
    			p = element("p");
    			create_component(button.$$.fragment);
    			attr_dev(p, "class", "control");
    			add_location(p, file$e, 685, 6, 18934);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, p, anchor);
    			mount_component(button, p, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty[0] & /*isLoadingTestParent*/ 2048) select_changes.loading = /*isLoadingTestParent*/ ctx[11];

    			if (dirty[0] & /*promiseLoadTestIDs*/ 131072 | dirty[2] & /*$$scope*/ 16384) {
    				select_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_selected && dirty[0] & /*tmp_test_id*/ 32) {
    				updating_selected = true;
    				select_changes.selected = /*tmp_test_id*/ ctx[5];
    				add_flush_callback(() => updating_selected = false);
    			}

    			select.$set(select_changes);
    			const button_changes = {};

    			if (dirty[2] & /*$$scope*/ 16384) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(p);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(673:4) <Field>",
    		ctx
    	});

    	return block;
    }

    // (696:4) <Button       type="is-dark is-fullwidth"       on:click={(e) => addQuestion()}       loading={isLoadingQuestion}       expanded     >
    function create_default_slot_1$1(ctx) {
    	let icon;
    	let current;
    	icon = new Icon({ props: { icon: "plus" }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(696:4) <Button       type=\\\"is-dark is-fullwidth\\\"       on:click={(e) => addQuestion()}       loading={isLoadingQuestion}       expanded     >",
    		ctx
    	});

    	return block;
    }

    // (705:4) <Notification       icon={true}       type={notificationQuestion.type}       bind:active={notificationQuestion.showUp}     >
    function create_default_slot$1(ctx) {
    	let t_value = /*notificationQuestion*/ ctx[16].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*notificationQuestion*/ 65536 && t_value !== (t_value = /*notificationQuestion*/ ctx[16].message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(705:4) <Notification       icon={true}       type={notificationQuestion.type}       bind:active={notificationQuestion.showUp}     >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let modal;
    	let updating_active;
    	let t0;
    	let div4;
    	let div1;
    	let label0;
    	let t2;
    	let field0;
    	let t3;
    	let button0;
    	let t4;
    	let field1;
    	let t5;
    	let field2;
    	let t6;
    	let field3;
    	let t7;
    	let field4;
    	let t8;
    	let div0;
    	let switch_1;
    	let updating_checked;
    	let t9;
    	let button1;
    	let t10;
    	let notification0;
    	let updating_active_1;
    	let t11;
    	let div3;
    	let field5;
    	let t12;
    	let field6;
    	let t13;
    	let field7;
    	let t14;
    	let field8;
    	let t15;
    	let label1;
    	let t17;
    	let button2;
    	let t18;
    	let div2;
    	let taglist;
    	let t19;
    	let label2;
    	let t21;
    	let field9;
    	let t22;
    	let t23;
    	let label3;
    	let t25;
    	let field10;
    	let t26;
    	let button3;
    	let t27;
    	let notification1;
    	let updating_active_2;
    	let current;

    	function modal_active_binding(value) {
    		/*modal_active_binding*/ ctx[32].call(null, value);
    	}

    	let modal_props = {
    		$$slots: { default: [create_default_slot_28] },
    		$$scope: { ctx }
    	};

    	if (/*isModalActive*/ ctx[14] !== void 0) {
    		modal_props.active = /*isModalActive*/ ctx[14];
    	}

    	modal = new Modal({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, "active", modal_active_binding));

    	field0 = new Field({
    			props: {
    				$$slots: { default: [create_default_slot_26] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0 = new Button({
    			props: {
    				type: "is-dark block",
    				loading: /*isLoadingGenerateID*/ ctx[12],
    				disabled: !/*tmp_test_category*/ ctx[0].category_id,
    				$$slots: { default: [create_default_slot_25] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", function () {
    		if (is_function(/*generateCorrectTestTitle*/ ctx[22](/*tmp_test_category*/ ctx[0].category_id, /*tmp_test_category*/ ctx[0].category_name))) /*generateCorrectTestTitle*/ ctx[22](/*tmp_test_category*/ ctx[0].category_id, /*tmp_test_category*/ ctx[0].category_name).apply(this, arguments);
    	});

    	field1 = new Field({
    			props: {
    				label: "test title",
    				$$slots: { default: [create_default_slot_24] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	field2 = new Field({
    			props: {
    				label: "test description",
    				$$slots: { default: [create_default_slot_23] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	field3 = new Field({
    			props: {
    				label: "difficulty",
    				$$slots: { default: [create_default_slot_22] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	field4 = new Field({
    			props: {
    				label: "Score To Pass",
    				$$slots: { default: [create_default_slot_21] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function switch_1_checked_binding(value) {
    		/*switch_1_checked_binding*/ ctx[38].call(null, value);
    	}

    	let switch_1_props = {
    		$$slots: { default: [create_default_slot_20] },
    		$$scope: { ctx }
    	};

    	if (/*tmp_status*/ ctx[6] !== void 0) {
    		switch_1_props.checked = /*tmp_status*/ ctx[6];
    	}

    	switch_1 = new Switch({ props: switch_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch_1, "checked", switch_1_checked_binding));

    	button1 = new Button({
    			props: {
    				type: "is-dark is-fullwidth",
    				loading: /*isLoadingTest*/ ctx[8],
    				expanded: true,
    				$$slots: { default: [create_default_slot_19] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_2*/ ctx[39]);

    	function notification0_active_binding(value) {
    		/*notification0_active_binding*/ ctx[40].call(null, value);
    	}

    	let notification0_props = {
    		icon: true,
    		type: /*notificationTest*/ ctx[15].type,
    		$$slots: { default: [create_default_slot_18] },
    		$$scope: { ctx }
    	};

    	if (/*notificationTest*/ ctx[15].showUp !== void 0) {
    		notification0_props.active = /*notificationTest*/ ctx[15].showUp;
    	}

    	notification0 = new Notification({
    			props: notification0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(notification0, "active", notification0_active_binding));

    	field5 = new Field({
    			props: {
    				label: "question",
    				$$slots: { default: [create_default_slot_17] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	field6 = new Field({
    			props: {
    				label: "hint",
    				$$slots: { default: [create_default_slot_16] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	field7 = new Field({
    			props: {
    				label: "Point",
    				$$slots: { default: [create_default_slot_15] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	field8 = new Field({
    			props: {
    				label: "correction",
    				$$slots: { default: [create_default_slot_14] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2 = new Button({
    			props: {
    				expanded: true,
    				type: "is-dark",
    				loading: /*isLoadingTags*/ ctx[13],
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button2.$on("click", /*click_handler_3*/ ctx[45]);

    	taglist = new Taglist({
    			props: {
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	field9 = new Field({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let each_value_1 = /*answers*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else_3 = null;

    	if (!each_value_1.length) {
    		each_1_else_3 = create_else_block$3(ctx);
    	}

    	field10 = new Field({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button3 = new Button({
    			props: {
    				type: "is-dark is-fullwidth",
    				loading: /*isLoadingQuestion*/ ctx[10],
    				expanded: true,
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button3.$on("click", /*click_handler_7*/ ctx[53]);

    	function notification1_active_binding(value) {
    		/*notification1_active_binding*/ ctx[54].call(null, value);
    	}

    	let notification1_props = {
    		icon: true,
    		type: /*notificationQuestion*/ ctx[16].type,
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*notificationQuestion*/ ctx[16].showUp !== void 0) {
    		notification1_props.active = /*notificationQuestion*/ ctx[16].showUp;
    	}

    	notification1 = new Notification({
    			props: notification1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(notification1, "active", notification1_active_binding));

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "Category";
    			t2 = space();
    			create_component(field0.$$.fragment);
    			t3 = space();
    			create_component(button0.$$.fragment);
    			t4 = space();
    			create_component(field1.$$.fragment);
    			t5 = space();
    			create_component(field2.$$.fragment);
    			t6 = space();
    			create_component(field3.$$.fragment);
    			t7 = space();
    			create_component(field4.$$.fragment);
    			t8 = space();
    			div0 = element("div");
    			create_component(switch_1.$$.fragment);
    			t9 = space();
    			create_component(button1.$$.fragment);
    			t10 = space();
    			create_component(notification0.$$.fragment);
    			t11 = space();
    			div3 = element("div");
    			create_component(field5.$$.fragment);
    			t12 = space();
    			create_component(field6.$$.fragment);
    			t13 = space();
    			create_component(field7.$$.fragment);
    			t14 = space();
    			create_component(field8.$$.fragment);
    			t15 = space();
    			label1 = element("label");
    			label1.textContent = "add tags (optional)";
    			t17 = space();
    			create_component(button2.$$.fragment);
    			t18 = space();
    			div2 = element("div");
    			create_component(taglist.$$.fragment);
    			t19 = space();
    			label2 = element("label");
    			label2.textContent = "add answers";
    			t21 = space();
    			create_component(field9.$$.fragment);
    			t22 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else_3) {
    				each_1_else_3.c();
    			}

    			t23 = space();
    			label3 = element("label");
    			label3.textContent = "add test parent";
    			t25 = space();
    			create_component(field10.$$.fragment);
    			t26 = space();
    			create_component(button3.$$.fragment);
    			t27 = space();
    			create_component(notification1.$$.fragment);
    			attr_dev(label0, "for", "");
    			attr_dev(label0, "class", "label");
    			add_location(label0, file$e, 459, 4, 12600);
    			attr_dev(div0, "class", "field");
    			add_location(div0, file$e, 548, 4, 15087);
    			attr_dev(div1, "class", "tile is-vertical mx-4 notification");
    			add_location(div1, file$e, 457, 2, 12525);
    			attr_dev(label1, "class", "label");
    			add_location(label1, file$e, 608, 4, 16691);
    			attr_dev(div2, "class", "notification");
    			add_location(div2, file$e, 617, 4, 16922);
    			attr_dev(label2, "class", "label");
    			add_location(label2, file$e, 630, 4, 17252);
    			attr_dev(label3, "class", "label");
    			add_location(label3, file$e, 671, 4, 18530);
    			attr_dev(div3, "class", "tile is-vertical mr-4 notification");
    			add_location(div3, file$e, 571, 2, 15664);
    			attr_dev(div4, "class", "tile");
    			add_location(div4, file$e, 455, 0, 12470);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t2);
    			mount_component(field0, div1, null);
    			append_dev(div1, t3);
    			mount_component(button0, div1, null);
    			append_dev(div1, t4);
    			mount_component(field1, div1, null);
    			append_dev(div1, t5);
    			mount_component(field2, div1, null);
    			append_dev(div1, t6);
    			mount_component(field3, div1, null);
    			append_dev(div1, t7);
    			mount_component(field4, div1, null);
    			append_dev(div1, t8);
    			append_dev(div1, div0);
    			mount_component(switch_1, div0, null);
    			append_dev(div1, t9);
    			mount_component(button1, div1, null);
    			append_dev(div1, t10);
    			mount_component(notification0, div1, null);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			mount_component(field5, div3, null);
    			append_dev(div3, t12);
    			mount_component(field6, div3, null);
    			append_dev(div3, t13);
    			mount_component(field7, div3, null);
    			append_dev(div3, t14);
    			mount_component(field8, div3, null);
    			append_dev(div3, t15);
    			append_dev(div3, label1);
    			append_dev(div3, t17);
    			mount_component(button2, div3, null);
    			append_dev(div3, t18);
    			append_dev(div3, div2);
    			mount_component(taglist, div2, null);
    			append_dev(div3, t19);
    			append_dev(div3, label2);
    			append_dev(div3, t21);
    			mount_component(field9, div3, null);
    			append_dev(div3, t22);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			if (each_1_else_3) {
    				each_1_else_3.m(div3, null);
    			}

    			append_dev(div3, t23);
    			append_dev(div3, label3);
    			append_dev(div3, t25);
    			mount_component(field10, div3, null);
    			append_dev(div3, t26);
    			mount_component(button3, div3, null);
    			append_dev(div3, t27);
    			mount_component(notification1, div3, null);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const modal_changes = {};

    			if (dirty[0] & /*tags, isModalActive, tagsFromDB*/ 278544 | dirty[2] & /*$$scope*/ 16384) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty[0] & /*isModalActive*/ 16384) {
    				updating_active = true;
    				modal_changes.active = /*isModalActive*/ ctx[14];
    				add_flush_callback(() => updating_active = false);
    			}

    			modal.$set(modal_changes);
    			const field0_changes = {};

    			if (dirty[0] & /*isLoadingCategory, tmp_test_category*/ 513 | dirty[2] & /*$$scope*/ 16384) {
    				field0_changes.$$scope = { dirty, ctx };
    			}

    			field0.$set(field0_changes);
    			const button0_changes = {};
    			if (dirty[0] & /*isLoadingGenerateID*/ 4096) button0_changes.loading = /*isLoadingGenerateID*/ ctx[12];
    			if (dirty[0] & /*tmp_test_category*/ 1) button0_changes.disabled = !/*tmp_test_category*/ ctx[0].category_id;

    			if (dirty[2] & /*$$scope*/ 16384) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const field1_changes = {};

    			if (dirty[0] & /*test*/ 4 | dirty[2] & /*$$scope*/ 16384) {
    				field1_changes.$$scope = { dirty, ctx };
    			}

    			field1.$set(field1_changes);
    			const field2_changes = {};

    			if (dirty[0] & /*test*/ 4 | dirty[2] & /*$$scope*/ 16384) {
    				field2_changes.$$scope = { dirty, ctx };
    			}

    			field2.$set(field2_changes);
    			const field3_changes = {};

    			if (dirty[0] & /*test*/ 4 | dirty[2] & /*$$scope*/ 16384) {
    				field3_changes.$$scope = { dirty, ctx };
    			}

    			field3.$set(field3_changes);
    			const field4_changes = {};

    			if (dirty[0] & /*test*/ 4 | dirty[2] & /*$$scope*/ 16384) {
    				field4_changes.$$scope = { dirty, ctx };
    			}

    			field4.$set(field4_changes);
    			const switch_1_changes = {};

    			if (dirty[2] & /*$$scope*/ 16384) {
    				switch_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_checked && dirty[0] & /*tmp_status*/ 64) {
    				updating_checked = true;
    				switch_1_changes.checked = /*tmp_status*/ ctx[6];
    				add_flush_callback(() => updating_checked = false);
    			}

    			switch_1.$set(switch_1_changes);
    			const button1_changes = {};
    			if (dirty[0] & /*isLoadingTest*/ 256) button1_changes.loading = /*isLoadingTest*/ ctx[8];

    			if (dirty[2] & /*$$scope*/ 16384) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    			const notification0_changes = {};
    			if (dirty[0] & /*notificationTest*/ 32768) notification0_changes.type = /*notificationTest*/ ctx[15].type;

    			if (dirty[0] & /*notificationTest*/ 32768 | dirty[2] & /*$$scope*/ 16384) {
    				notification0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active_1 && dirty[0] & /*notificationTest*/ 32768) {
    				updating_active_1 = true;
    				notification0_changes.active = /*notificationTest*/ ctx[15].showUp;
    				add_flush_callback(() => updating_active_1 = false);
    			}

    			notification0.$set(notification0_changes);
    			const field5_changes = {};

    			if (dirty[0] & /*question*/ 2 | dirty[2] & /*$$scope*/ 16384) {
    				field5_changes.$$scope = { dirty, ctx };
    			}

    			field5.$set(field5_changes);
    			const field6_changes = {};

    			if (dirty[0] & /*question*/ 2 | dirty[2] & /*$$scope*/ 16384) {
    				field6_changes.$$scope = { dirty, ctx };
    			}

    			field6.$set(field6_changes);
    			const field7_changes = {};

    			if (dirty[0] & /*question*/ 2 | dirty[2] & /*$$scope*/ 16384) {
    				field7_changes.$$scope = { dirty, ctx };
    			}

    			field7.$set(field7_changes);
    			const field8_changes = {};

    			if (dirty[0] & /*question*/ 2 | dirty[2] & /*$$scope*/ 16384) {
    				field8_changes.$$scope = { dirty, ctx };
    			}

    			field8.$set(field8_changes);
    			const button2_changes = {};
    			if (dirty[0] & /*isLoadingTags*/ 8192) button2_changes.loading = /*isLoadingTags*/ ctx[13];

    			if (dirty[2] & /*$$scope*/ 16384) {
    				button2_changes.$$scope = { dirty, ctx };
    			}

    			button2.$set(button2_changes);
    			const taglist_changes = {};

    			if (dirty[0] & /*tags*/ 16 | dirty[2] & /*$$scope*/ 16384) {
    				taglist_changes.$$scope = { dirty, ctx };
    			}

    			taglist.$set(taglist_changes);
    			const field9_changes = {};

    			if (dirty[0] & /*tmp_answer*/ 128 | dirty[2] & /*$$scope*/ 16384) {
    				field9_changes.$$scope = { dirty, ctx };
    			}

    			field9.$set(field9_changes);

    			if (dirty[0] & /*deleteAnswer, answers*/ 2097160) {
    				each_value_1 = /*answers*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, t23);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (each_value_1.length) {
    					if (each_1_else_3) {
    						each_1_else_3.d(1);
    						each_1_else_3 = null;
    					}
    				} else if (!each_1_else_3) {
    					each_1_else_3 = create_else_block$3(ctx);
    					each_1_else_3.c();
    					each_1_else_3.m(div3, t23);
    				}
    			}

    			const field10_changes = {};

    			if (dirty[0] & /*promiseLoadTestIDs, isLoadingTestParent, tmp_test_id*/ 133152 | dirty[2] & /*$$scope*/ 16384) {
    				field10_changes.$$scope = { dirty, ctx };
    			}

    			field10.$set(field10_changes);
    			const button3_changes = {};
    			if (dirty[0] & /*isLoadingQuestion*/ 1024) button3_changes.loading = /*isLoadingQuestion*/ ctx[10];

    			if (dirty[2] & /*$$scope*/ 16384) {
    				button3_changes.$$scope = { dirty, ctx };
    			}

    			button3.$set(button3_changes);
    			const notification1_changes = {};
    			if (dirty[0] & /*notificationQuestion*/ 65536) notification1_changes.type = /*notificationQuestion*/ ctx[16].type;

    			if (dirty[0] & /*notificationQuestion*/ 65536 | dirty[2] & /*$$scope*/ 16384) {
    				notification1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active_2 && dirty[0] & /*notificationQuestion*/ 65536) {
    				updating_active_2 = true;
    				notification1_changes.active = /*notificationQuestion*/ ctx[16].showUp;
    				add_flush_callback(() => updating_active_2 = false);
    			}

    			notification1.$set(notification1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			transition_in(field0.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			transition_in(field3.$$.fragment, local);
    			transition_in(field4.$$.fragment, local);
    			transition_in(switch_1.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(notification0.$$.fragment, local);
    			transition_in(field5.$$.fragment, local);
    			transition_in(field6.$$.fragment, local);
    			transition_in(field7.$$.fragment, local);
    			transition_in(field8.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			transition_in(taglist.$$.fragment, local);
    			transition_in(field9.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(field10.$$.fragment, local);
    			transition_in(button3.$$.fragment, local);
    			transition_in(notification1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			transition_out(field0.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			transition_out(field3.$$.fragment, local);
    			transition_out(field4.$$.fragment, local);
    			transition_out(switch_1.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(notification0.$$.fragment, local);
    			transition_out(field5.$$.fragment, local);
    			transition_out(field6.$$.fragment, local);
    			transition_out(field7.$$.fragment, local);
    			transition_out(field8.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			transition_out(taglist.$$.fragment, local);
    			transition_out(field9.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(field10.$$.fragment, local);
    			transition_out(button3.$$.fragment, local);
    			transition_out(notification1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div4);
    			destroy_component(field0);
    			destroy_component(button0);
    			destroy_component(field1);
    			destroy_component(field2);
    			destroy_component(field3);
    			destroy_component(field4);
    			destroy_component(switch_1);
    			destroy_component(button1);
    			destroy_component(notification0);
    			destroy_component(field5);
    			destroy_component(field6);
    			destroy_component(field7);
    			destroy_component(field8);
    			destroy_component(button2);
    			destroy_component(taglist);
    			destroy_component(field9);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else_3) each_1_else_3.d();
    			destroy_component(field10);
    			destroy_component(button3);
    			destroy_component(notification1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AddData", slots, []);

    	let question = {
    		question_title: "",
    		question_hint: "",
    		question_correction: "",
    		question_point: 1
    	};

    	// -- Test  --
    	let test = {
    		test_title: "",
    		test_description: "",
    		status_id: "public",
    		score_to_pass: 35,
    		difficulty_id: "easy",
    		category_id: ""
    	};

    	// Answers
    	let answers = [];

    	// tags
    	let tags = [];

    	// -- Local Variables --
    	let tmp_test_id = ""; // for binding

    	let tmp_test_category = { category_id: "", category_name: "" }; // for binding
    	let tmp_status = false; // for binding

    	let tmp_answer = {
    		answer_title: "",
    		is_correct: false,
    		question
    	};

    	let isLoadingTest = false; // ui/ux
    	let isLoadingCategory = false; // ui/ux
    	let isLoadingQuestion = false; // ui/ux
    	let isLoadingTestParent = false; // ui/ux
    	let isLoadingGenerateID = false; // ui/ux
    	let isLoadingTags = false; // ui/ux
    	let isModalActive = false; // ui/ux

    	let notificationTest = {
    		showUp: false,
    		message: "",
    		type: "is-warning"
    	};

    	let notificationQuestion = {
    		showUp: false,
    		message: "",
    		type: "is-warning"
    	};

    	// To load ids from db
    	let promiseLoadTestIDs = loadTestIDs(); // for {await} svelte

    	let tagsFromDB = [];

    	// ____________ Client Data handling _____________________
    	function deleteTag(index) {
    		tags.splice(index, 1);
    		$$invalidate(4, tags);
    	}

    	function addAnswer() {
    		if (tmp_answer.answer_title == "") return;

    		answers.push({
    			answer_title: tmp_answer.answer_title,
    			is_correct: tmp_answer.is_correct
    		});

    		$$invalidate(3, answers);

    		// clear data
    		$$invalidate(7, tmp_answer.answer_title = "", tmp_answer);

    		$$invalidate(7, tmp_answer.is_correct = false, tmp_answer);
    	}

    	function deleteAnswer(index) {
    		answers.splice(index, 1);
    		$$invalidate(3, answers);
    	}

    	// __ notifictions of questions : for sending success or erros messages
    	function setNotificationQuestion({ message, type = "is-warning", timeout = 4000 }) {
    		$$invalidate(16, notificationQuestion.showUp = true, notificationQuestion); // show it
    		$$invalidate(16, notificationQuestion.message = message, notificationQuestion);
    		$$invalidate(16, notificationQuestion.type = type, notificationQuestion);

    		setTimeout(
    			() => {
    				$$invalidate(16, notificationQuestion.showUp = false, notificationQuestion); // close it
    				$$invalidate(16, notificationQuestion.message = "", notificationQuestion); // clear
    			},
    			timeout
    		);
    	}

    	// __ notifictions of test : for sending success or erros messages
    	function setNotificationTest({ message, type = "is-warning", timeout = 4000 }) {
    		$$invalidate(15, notificationTest.showUp = true, notificationTest); // show it
    		$$invalidate(15, notificationTest.message = message, notificationTest);
    		$$invalidate(15, notificationTest.type = type, notificationTest);

    		setTimeout(
    			() => {
    				$$invalidate(15, notificationTest.showUp = false, notificationTest); // close it
    				$$invalidate(15, notificationTest.message = "", notificationTest); // clear
    			},
    			timeout
    		);
    	}

    	function resetFields({ type }) {
    		if (type == "tests") {
    			$$invalidate(2, test.test_title = "", test);
    			$$invalidate(2, test.test_description = "", test);
    			$$invalidate(2, test.status_id = "public", test);
    			$$invalidate(2, test.score_to_pass = 35, test);
    			$$invalidate(2, test.difficulty_id = "easy", test);
    			$$invalidate(2, test.category_id = "", test);
    			$$invalidate(6, tmp_status = false);
    		} else if (type == "questions") {
    			$$invalidate(1, question.question_title = "", question);
    			$$invalidate(1, question.question_hint = "", question);
    			$$invalidate(1, question.question_correction = "", question);
    			$$invalidate(1, question.question_point = 1, question);
    			$$invalidate(3, answers = []);
    			$$invalidate(4, tags = []);
    			$$invalidate(5, tmp_test_id = "");
    			$$invalidate(7, tmp_answer.answer_title = "", tmp_answer);
    			$$invalidate(7, tmp_answer.is_correct = false, tmp_answer);
    			$$invalidate(7, tmp_answer.question = "", tmp_answer);
    		}
    	}

    	// ____________ Supabase Data Handling ____________
    	// for generate a unique test name 1,2,3 etc..
    	async function generateCorrectTestTitle(category_id, category_name) {
    		$$invalidate(12, isLoadingGenerateID = true); // ux

    		try {
    			// get test count from db
    			let { data, error } = await supabase.from("test").select("test_title").eq("category_id", category_id).order("order_test_title", { ascending: false });

    			if (error) throw error.message;

    			// generate the Title template: example "Life in the UK Chapter" or "Life in the UK Exam"
    			category_name = category_name.charAt(0).toUpperCase() + category_name.slice(1); //  uppercase the first letter

    			let template = `Life in the UK ${category_name.replace(/s$/g, "")}`; // Make plural word singluar (only for words that end with an s)

    			// check if no tests doc!
    			if (data.length === 0) {
    				$$invalidate(12, isLoadingGenerateID = !true); // ux
    				$$invalidate(2, test.test_title = `${template} 1`, test);
    				return;
    			}

    			let lastIDIndex = parseInt(data[0].test_title.replace(/\D/g, "")); // extract number from text, then convert it to Integer
    			let length = data.length;

    			// case 1: the last index of the tests is > than the length of ids 🙄
    			if (lastIDIndex > length) {
    				$$invalidate(12, isLoadingGenerateID = !true); // ux
    				$$invalidate(2, test.test_title = `${template} ${lastIDIndex + 1}`, test);
    				return;
    			} else // case 2: the last index of the tests is < than the length of ids 🙄
    			if (lastIDIndex < length) {
    				$$invalidate(12, isLoadingGenerateID = !true); // ux
    				$$invalidate(2, test.test_title = `${template} ${length + 1}`, test);
    				return;
    			}

    			// defalut return 😎
    			$$invalidate(12, isLoadingGenerateID = !true); // ux

    			$$invalidate(2, test.test_title = `${template} ${lastIDIndex + 1}`, test);
    			return;
    		} catch(error) {
    			setNotificationTest({ message: error });
    		}
    	}

    	// add test row to sql db
    	async function addTest() {
    		$$invalidate(8, isLoadingTest = true); // ux

    		try {
    			// check format:
    			let collector = [];

    			if (test.test_title === "") {
    				collector.push("title");
    			}

    			if (test.test_description === "") {
    				collector.push("description");
    			}

    			if (test.score_to_pass === "") {
    				collector.push("score to pass");
    			}

    			if (tmp_test_category.category_id === "") {
    				collector.push("category");
    			}

    			// dynamic responce text 🤭
    			if (collector.length > 0) {
    				let message = `The ${collector} ${collector.length > 1 ? "are" : "is"} empty 🙄!`;
    				setNotificationTest({ message });
    				$$invalidate(8, isLoadingTest = false); // ux
    				return;
    			}

    			// the score_to_pass must be positive non-zero
    			$$invalidate(2, test.score_to_pass = parseInt(test.score_to_pass), test);

    			if (test.score_to_pass <= 0) {
    				setNotificationTest({
    					message: `score-to-pass must be > 0 🤦‍♂`
    				});

    				$$invalidate(8, isLoadingTest = false); // ux
    				return;
    			}

    			$$invalidate(2, test.status_id = tmp_status ? "private" : "public", test);
    			$$invalidate(2, test.category_id = tmp_test_category.category_id, test);

    			// set data in db
    			let { error } = await supabase.from("test").insert(test);

    			if (error) throw error.message;

    			// send message to the author 🤗 ux
    			setNotificationTest({
    				message: `the '${test.test_title}' is successfully added!`,
    				type: "is-success"
    			});

    			$$invalidate(8, isLoadingTest = false); // ux
    			resetFields({ type: "tests" }); // reset all test fields 😉 ux
    		} catch(error) {
    			setNotificationTest({ message: error, type: "is-danger" });
    			$$invalidate(8, isLoadingTest = false); // ux
    		}
    	}

    	async function addQuestion() {
    		$$invalidate(10, isLoadingQuestion = true); //ux

    		try {
    			// check format:
    			let collector = [];

    			if (question.question_title === "") {
    				collector.push("question");
    			}

    			if (question.question_hint === "") {
    				collector.push("hint");
    			}

    			if (question.question_correction === "") {
    				collector.push("correction");
    			}

    			// Tags in this case optional
    			/*
    if (tags.length === 0) {
      collector.push("tags");
    }
    */
    			if (answers.length === 0) {
    				collector.push("answers");
    			}

    			if (tmp_test_id === "") {
    				collector.push("test parent");
    			}

    			// dynamic responce text 🤭
    			if (collector.length > 0) {
    				let message = `The ${collector} ${collector.length > 1 ? "are" : "is"} empty 🙄!`;
    				setNotificationQuestion({ message });
    				$$invalidate(10, isLoadingQuestion = false); // ux
    				return;
    			}

    			if (parseInt(question.question_point) <= 0) {
    				setNotificationQuestion({ message: `point must be > 0 🤦‍♂` });
    				$$invalidate(10, isLoadingQuestion = false); // ux
    				return;
    			}

    			if (answers.length < 2) {
    				setNotificationQuestion({
    					message: `at least you have to put 2 answers 🤦‍♂`
    				});

    				$$invalidate(10, isLoadingQuestion = false); // ux
    				return;
    			}

    			let counter = 0;

    			for (const e of answers) {
    				if (e.is_correct == true) counter++;
    			}

    			if (counter == 0) {
    				setNotificationQuestion({
    					message: `at least you have to put 1 correct answer 🤦‍♂`
    				});

    				$$invalidate(10, isLoadingQuestion = false); // ux
    				return;
    			}

    			// call sql function from db
    			const { data, error } = await supabase.rpc("create_question", {
    				t_id: tmp_test_id,
    				q_title: question.question_title,
    				q_hint: question.question_hint,
    				q_correction: question.question_correction,
    				q_point: question.question_point,
    				answers,
    				tags
    			});

    			if (error) throw error.message;

    			// send message to the author 🤗 ux
    			setNotificationQuestion({
    				message: `the question_id '${data.question_id}' is successfully added!`,
    				type: "is-success"
    			});

    			$$invalidate(10, isLoadingQuestion = false); // ux
    			resetFields({ type: "questions" }); // reset all questions fields 😉 ux
    		} catch(error) {
    			setNotificationQuestion({ message: error, type: "is-danger" });
    			$$invalidate(10, isLoadingQuestion = false); // ux
    		}
    	}

    	// Load tests ids from supabase
    	async function loadTestIDs() {
    		$$invalidate(11, isLoadingTestParent = true); // ux 😉

    		try {
    			const { data, error } = await supabase.from("test").select("test_id, test_title").order("order_test_title", { ascending: false });
    			if (error) throw error.message;
    			$$invalidate(11, isLoadingTestParent = false); // ux 😉
    			return data;
    		} catch(error) {
    			setNotificationQuestion({ message: error, type: "is-danger" });
    			$$invalidate(11, isLoadingTestParent = false); // ux 😉
    		}
    	}

    	// Load tags from supabase
    	async function loadTags({ showModal = false }) {
    		$$invalidate(13, isLoadingTags = true); // ux 😉

    		try {
    			const { data, error } = await supabase.from("tag").select("tag_id");
    			if (error) throw error.message;
    			$$invalidate(13, isLoadingTags = false); // ux 😉
    			if (showModal) $$invalidate(14, isModalActive = true); // ux 😉
    			$$invalidate(18, tagsFromDB = data.map(e => e.tag_id));
    			tagsFromDB.sort();
    		} catch(error) {
    			setNotificationQuestion({ message: error, type: "is-danger" });
    			$$invalidate(13, isLoadingTags = false); // ux 😉
    			$$invalidate(14, isModalActive = false); // ux
    		}
    	}

    	// Load categories from supabase
    	async function loadCategories() {
    		$$invalidate(9, isLoadingCategory = true); // ux 😉

    		try {
    			const { data, error } = await supabase.from("category").select("*");
    			if (error) throw error.message;
    			$$invalidate(9, isLoadingCategory = false); // ux 😉
    			return data;
    		} catch(error) {
    			setNotificationTest({ message: error, type: "is-danger" });
    			$$invalidate(9, isLoadingCategory = false); // ux 😉
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<AddData> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[], []];

    	function input_change_handler() {
    		tags = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(4, tags);
    	}

    	const click_handler = () => $$invalidate(14, isModalActive = false);

    	const click_handler_1 = () => {
    		$$invalidate(4, tags = []);
    	};

    	function modal_active_binding(value) {
    		isModalActive = value;
    		$$invalidate(14, isModalActive);
    	}

    	function select_selected_binding(value) {
    		tmp_test_category = value;
    		$$invalidate(0, tmp_test_category);
    	}

    	function input_value_binding(value) {
    		test.test_title = value;
    		$$invalidate(2, test);
    	}

    	function input_value_binding_1(value) {
    		test.test_description = value;
    		$$invalidate(2, test);
    	}

    	function input_change_handler_1() {
    		test.difficulty_id = this.__value;
    		$$invalidate(2, test);
    	}

    	function input_value_binding_2(value) {
    		test.score_to_pass = value;
    		$$invalidate(2, test);
    	}

    	function switch_1_checked_binding(value) {
    		tmp_status = value;
    		$$invalidate(6, tmp_status);
    	}

    	const click_handler_2 = e => addTest();

    	function notification0_active_binding(value) {
    		notificationTest.showUp = value;
    		$$invalidate(15, notificationTest);
    	}

    	function input_value_binding_3(value) {
    		question.question_title = value;
    		$$invalidate(1, question);
    	}

    	function input_value_binding_4(value) {
    		question.question_hint = value;
    		$$invalidate(1, question);
    	}

    	function input_value_binding_5(value) {
    		question.question_point = value;
    		$$invalidate(1, question);
    	}

    	function input_value_binding_6(value) {
    		question.question_correction = value;
    		$$invalidate(1, question);
    	}

    	const click_handler_3 = () => loadTags({ showModal: true });
    	const close_handler = (i, e) => deleteTag(i);

    	function input_value_binding_7(value) {
    		tmp_answer.answer_title = value;
    		$$invalidate(7, tmp_answer);
    	}

    	function select_selected_binding_1(value) {
    		tmp_answer.is_correct = value;
    		$$invalidate(7, tmp_answer);
    	}

    	const click_handler_4 = e => addAnswer();
    	const click_handler_5 = i => deleteAnswer(i);

    	function select_selected_binding_2(value) {
    		tmp_test_id = value;
    		$$invalidate(5, tmp_test_id);
    	}

    	const click_handler_6 = e => $$invalidate(17, promiseLoadTestIDs = loadTestIDs());
    	const click_handler_7 = e => addQuestion();

    	function notification1_active_binding(value) {
    		notificationQuestion.showUp = value;
    		$$invalidate(16, notificationQuestion);
    	}

    	$$self.$capture_state = () => ({
    		Field,
    		Input,
    		Switch,
    		Tag,
    		Taglist,
    		Button,
    		Icon,
    		Select,
    		Notification,
    		Modal,
    		supabase,
    		question,
    		test,
    		answers,
    		tags,
    		tmp_test_id,
    		tmp_test_category,
    		tmp_status,
    		tmp_answer,
    		isLoadingTest,
    		isLoadingCategory,
    		isLoadingQuestion,
    		isLoadingTestParent,
    		isLoadingGenerateID,
    		isLoadingTags,
    		isModalActive,
    		notificationTest,
    		notificationQuestion,
    		promiseLoadTestIDs,
    		tagsFromDB,
    		deleteTag,
    		addAnswer,
    		deleteAnswer,
    		setNotificationQuestion,
    		setNotificationTest,
    		resetFields,
    		generateCorrectTestTitle,
    		addTest,
    		addQuestion,
    		loadTestIDs,
    		loadTags,
    		loadCategories
    	});

    	$$self.$inject_state = $$props => {
    		if ("question" in $$props) $$invalidate(1, question = $$props.question);
    		if ("test" in $$props) $$invalidate(2, test = $$props.test);
    		if ("answers" in $$props) $$invalidate(3, answers = $$props.answers);
    		if ("tags" in $$props) $$invalidate(4, tags = $$props.tags);
    		if ("tmp_test_id" in $$props) $$invalidate(5, tmp_test_id = $$props.tmp_test_id);
    		if ("tmp_test_category" in $$props) $$invalidate(0, tmp_test_category = $$props.tmp_test_category);
    		if ("tmp_status" in $$props) $$invalidate(6, tmp_status = $$props.tmp_status);
    		if ("tmp_answer" in $$props) $$invalidate(7, tmp_answer = $$props.tmp_answer);
    		if ("isLoadingTest" in $$props) $$invalidate(8, isLoadingTest = $$props.isLoadingTest);
    		if ("isLoadingCategory" in $$props) $$invalidate(9, isLoadingCategory = $$props.isLoadingCategory);
    		if ("isLoadingQuestion" in $$props) $$invalidate(10, isLoadingQuestion = $$props.isLoadingQuestion);
    		if ("isLoadingTestParent" in $$props) $$invalidate(11, isLoadingTestParent = $$props.isLoadingTestParent);
    		if ("isLoadingGenerateID" in $$props) $$invalidate(12, isLoadingGenerateID = $$props.isLoadingGenerateID);
    		if ("isLoadingTags" in $$props) $$invalidate(13, isLoadingTags = $$props.isLoadingTags);
    		if ("isModalActive" in $$props) $$invalidate(14, isModalActive = $$props.isModalActive);
    		if ("notificationTest" in $$props) $$invalidate(15, notificationTest = $$props.notificationTest);
    		if ("notificationQuestion" in $$props) $$invalidate(16, notificationQuestion = $$props.notificationQuestion);
    		if ("promiseLoadTestIDs" in $$props) $$invalidate(17, promiseLoadTestIDs = $$props.promiseLoadTestIDs);
    		if ("tagsFromDB" in $$props) $$invalidate(18, tagsFromDB = $$props.tagsFromDB);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*tmp_test_category*/ 1) {
    			 console.log(tmp_test_category);
    		}
    	};

    	return [
    		tmp_test_category,
    		question,
    		test,
    		answers,
    		tags,
    		tmp_test_id,
    		tmp_status,
    		tmp_answer,
    		isLoadingTest,
    		isLoadingCategory,
    		isLoadingQuestion,
    		isLoadingTestParent,
    		isLoadingGenerateID,
    		isLoadingTags,
    		isModalActive,
    		notificationTest,
    		notificationQuestion,
    		promiseLoadTestIDs,
    		tagsFromDB,
    		deleteTag,
    		addAnswer,
    		deleteAnswer,
    		generateCorrectTestTitle,
    		addTest,
    		addQuestion,
    		loadTestIDs,
    		loadTags,
    		loadCategories,
    		input_change_handler,
    		$$binding_groups,
    		click_handler,
    		click_handler_1,
    		modal_active_binding,
    		select_selected_binding,
    		input_value_binding,
    		input_value_binding_1,
    		input_change_handler_1,
    		input_value_binding_2,
    		switch_1_checked_binding,
    		click_handler_2,
    		notification0_active_binding,
    		input_value_binding_3,
    		input_value_binding_4,
    		input_value_binding_5,
    		input_value_binding_6,
    		click_handler_3,
    		close_handler,
    		input_value_binding_7,
    		select_selected_binding_1,
    		click_handler_4,
    		click_handler_5,
    		select_selected_binding_2,
    		click_handler_6,
    		click_handler_7,
    		notification1_active_binding
    	];
    }

    class AddData extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {}, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddData",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/AddTags.svelte generated by Svelte v3.31.2 */
    const file$f = "src/AddTags.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (152:4) <Button type="is-dark" on:click={addTag} loading={isLoading}>
    function create_default_slot_5$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Push!");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5$1.name,
    		type: "slot",
    		source: "(152:4) <Button type=\\\"is-dark\\\" on:click={addTag} loading={isLoading}>",
    		ctx
    	});

    	return block;
    }

    // (141:0) <Field>
    function create_default_slot_4$1(ctx) {
    	let input;
    	let updating_value;
    	let t;
    	let p;
    	let button;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[7].call(null, value);
    	}

    	let input_props = {
    		expanded: true,
    		placeholder: "Insert 1 tag name like (sport) or multi-tags like (sport,history,animal ..) 🧒",
    		icon: "fire"
    	};

    	if (/*tag*/ ctx[0] !== void 0) {
    		input_props.value = /*tag*/ ctx[0];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, "value", input_value_binding));
    	input.$on("keypress", /*keypress_handler*/ ctx[8]);

    	button = new Button({
    			props: {
    				type: "is-dark",
    				loading: /*isLoading*/ ctx[3],
    				$$slots: { default: [create_default_slot_5$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*addTag*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(input.$$.fragment);
    			t = space();
    			p = element("p");
    			create_component(button.$$.fragment);
    			attr_dev(p, "class", "control");
    			add_location(p, file$f, 150, 2, 3693);
    		},
    		m: function mount(target, anchor) {
    			mount_component(input, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, p, anchor);
    			mount_component(button, p, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty & /*tag*/ 1) {
    				updating_value = true;
    				input_changes.value = /*tag*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    			const button_changes = {};
    			if (dirty & /*isLoading*/ 8) button_changes.loading = /*isLoading*/ ctx[3];

    			if (dirty & /*$$scope*/ 65536) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(input, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(p);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4$1.name,
    		type: "slot",
    		source: "(141:0) <Field>",
    		ctx
    	});

    	return block;
    }

    // (157:0) <Notification   icon={true}   type={notification.type}   bind:active={notification.showUp} >
    function create_default_slot_3$1(ctx) {
    	let t_value = /*notification*/ ctx[2].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notification*/ 4 && t_value !== (t_value = /*notification*/ ctx[2].message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(157:0) <Notification   icon={true}   type={notification.type}   bind:active={notification.showUp} >",
    		ctx
    	});

    	return block;
    }

    // (168:4) <Tag closable type="is-dark" size="is-large" on:close={(e) => deleteTag(i)}>
    function create_default_slot_2$1(ctx) {
    	let t0_value = /*item*/ ctx[13] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tags*/ 2 && t0_value !== (t0_value = /*item*/ ctx[13] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(168:4) <Tag closable type=\\\"is-dark\\\" size=\\\"is-large\\\" on:close={(e) => deleteTag(i)}>",
    		ctx
    	});

    	return block;
    }

    // (167:2) {#each tags as item, i}
    function create_each_block$1(ctx) {
    	let tag_1;
    	let current;

    	function close_handler(...args) {
    		return /*close_handler*/ ctx[10](/*i*/ ctx[15], ...args);
    	}

    	tag_1 = new Tag({
    			props: {
    				closable: true,
    				type: "is-dark",
    				size: "is-large",
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tag_1.$on("close", close_handler);

    	const block = {
    		c: function create() {
    			create_component(tag_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tag_1, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tag_1_changes = {};

    			if (dirty & /*$$scope, tags*/ 65538) {
    				tag_1_changes.$$scope = { dirty, ctx };
    			}

    			tag_1.$set(tag_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tag_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tag_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tag_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(167:2) {#each tags as item, i}",
    		ctx
    	});

    	return block;
    }

    // (166:0) <Taglist>
    function create_default_slot_1$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*tags*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*deleteTag, tags*/ 66) {
    				each_value = /*tags*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(166:0) <Taglist>",
    		ctx
    	});

    	return block;
    }

    // (177:27) 
    function create_if_block_1$8(ctx) {
    	let message;
    	let current;

    	message = new Message({
    			props: {
    				title: "Sorry",
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(message.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(message, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(message.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(message.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(message, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$8.name,
    		type: "if",
    		source: "(177:27) ",
    		ctx
    	});

    	return block;
    }

    // (175:0) {#if isLoadingTags}
    function create_if_block$9(ctx) {
    	let progress;
    	let current;
    	progress = new Progress({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(progress.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(progress, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progress.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progress.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(progress, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(175:0) {#if isLoadingTags}",
    		ctx
    	});

    	return block;
    }

    // (178:2) <Message title="Sorry">
    function create_default_slot$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("No Data In Firebase 😭");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(178:2) <Message title=\\\"Sorry\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let label;
    	let t1;
    	let field;
    	let t2;
    	let notification_1;
    	let updating_active;
    	let t3;
    	let taglist;
    	let t4;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	field = new Field({
    			props: {
    				$$slots: { default: [create_default_slot_4$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	function notification_1_active_binding(value) {
    		/*notification_1_active_binding*/ ctx[9].call(null, value);
    	}

    	let notification_1_props = {
    		icon: true,
    		type: /*notification*/ ctx[2].type,
    		$$slots: { default: [create_default_slot_3$1] },
    		$$scope: { ctx }
    	};

    	if (/*notification*/ ctx[2].showUp !== void 0) {
    		notification_1_props.active = /*notification*/ ctx[2].showUp;
    	}

    	notification_1 = new Notification({
    			props: notification_1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(notification_1, "active", notification_1_active_binding));

    	taglist = new Taglist({
    			props: {
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const if_block_creators = [create_if_block$9, create_if_block_1$8];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*isLoadingTags*/ ctx[4]) return 0;
    		if (/*tags*/ ctx[1].length == 0) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			label.textContent = "Push tags in database!";
    			t1 = space();
    			create_component(field.$$.fragment);
    			t2 = space();
    			create_component(notification_1.$$.fragment);
    			t3 = space();
    			create_component(taglist.$$.fragment);
    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(label, "class", "label");
    			add_location(label, file$f, 139, 0, 3381);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(field, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(notification_1, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(taglist, target, anchor);
    			insert_dev(target, t4, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const field_changes = {};

    			if (dirty & /*$$scope, isLoading, tag*/ 65545) {
    				field_changes.$$scope = { dirty, ctx };
    			}

    			field.$set(field_changes);
    			const notification_1_changes = {};
    			if (dirty & /*notification*/ 4) notification_1_changes.type = /*notification*/ ctx[2].type;

    			if (dirty & /*$$scope, notification*/ 65540) {
    				notification_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active && dirty & /*notification*/ 4) {
    				updating_active = true;
    				notification_1_changes.active = /*notification*/ ctx[2].showUp;
    				add_flush_callback(() => updating_active = false);
    			}

    			notification_1.$set(notification_1_changes);
    			const taglist_changes = {};

    			if (dirty & /*$$scope, tags*/ 65538) {
    				taglist_changes.$$scope = { dirty, ctx };
    			}

    			taglist.$set(taglist_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field.$$.fragment, local);
    			transition_in(notification_1.$$.fragment, local);
    			transition_in(taglist.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field.$$.fragment, local);
    			transition_out(notification_1.$$.fragment, local);
    			transition_out(taglist.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (detaching) detach_dev(t1);
    			destroy_component(field, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(notification_1, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(taglist, detaching);
    			if (detaching) detach_dev(t4);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AddTags", slots, []);
    	let tag;
    	let tags = [];

    	let notification = {
    		showUp: false,
    		message: "",
    		type: "is-warning"
    	};

    	// ui/ux
    	let isLoading = false; // for push

    	let isLoadingTags = false; // for load

    	// Process tags, and  push it to firebase
    	async function addTag() {
    		// ux
    		$$invalidate(3, isLoading = true);

    		// remove white spaces, tabs ..
    		$$invalidate(0, tag = tag.trim());

    		// we don't want empty data
    		if (tag === "") {
    			$$invalidate(3, isLoading = false);
    			return;
    		} else // we don't want duplicated data
    		if (tags.includes(tag)) {
    			$$invalidate(3, isLoading = false);
    			return;
    		} else // if there is many tags in input (sport,manga ..) add them all 👍
    		if (tag.split(",").length > 1) {
    			$$invalidate(0, tag = tag.split(",").map(e => e.trim()).filter(e => !tags.includes(e))); // avoid duplication tags in this case too 👍
    			$$invalidate(1, tags = [...tags, ...tag]);
    		} else // just one tag in input
    		{
    			$$invalidate(1, tags = [...tags, tag]);
    		}

    		// -- finally push to firebase
    		try {
    			// to insert one or array of tags at same time!
    			const data = Array.isArray(tag)
    			? tag.map(e => ({ tag_id: e }))
    			: { tag_id: tag };

    			await supabase.from("tag").insert(data);
    		} catch(error) {
    			loadTags(); // load the old tags from db
    			setnotification({ message: error });
    		} finally {
    			// ux
    			$$invalidate(0, tag = ""); // reset

    			$$invalidate(3, isLoading = false);
    		}
    	}

    	// Detele tags from ui & firebase
    	async function deleteTag(index) {
    		const selected_tag = tags[index];
    		$$invalidate(4, isLoadingTags = true);
    		tags.splice(index, 1);
    		$$invalidate(1, tags);

    		// -- finally push to supabase
    		try {
    			const { count } = await supabase.from("question_tag").select("*", { count: "exact" }).eq("tag_id", selected_tag);
    			if (count > 0) throw "You cannot delete this tag, because there are some questions that depend on it";
    			const { error } = await supabase.from("tag").delete().eq("tag_id", selected_tag);
    			if (error) throw error.message;
    		} catch(error) {
    			loadTags(); // load the old tags from db
    			setnotification({ message: error });
    		} finally {
    			// ux
    			$$invalidate(4, isLoadingTags = false);
    		}
    	}

    	// Show notifications
    	function setnotification({ message, type = "is-warning", timeout = 4000 }) {
    		$$invalidate(2, notification.showUp = true, notification); // show it
    		$$invalidate(2, notification.message = message, notification);
    		$$invalidate(2, notification.type = type, notification);

    		setTimeout(
    			() => {
    				$$invalidate(2, notification.showUp = false, notification); // close it
    				$$invalidate(2, notification.message = "", notification); // clear
    			},
    			timeout
    		);
    	}

    	// Load tags from firebase
    	async function loadTags() {
    		$$invalidate(4, isLoadingTags = true); // ux 😉

    		try {
    			const { data, error } = await supabase.from("tag").select("tag_id");
    			$$invalidate(4, isLoadingTags = false); // ux 😉

    			// check if 'tags' array exist in db
    			$$invalidate(1, tags = data.map(e => e.tag_id));
    		} catch(error) {
    			setnotification({ message: error, type: "is-danger" });
    			$$invalidate(4, isLoadingTags = false); // ux 😉
    		}
    	}

    	// First
    	onMount(async () => {
    		loadTags();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AddTags> was created with unknown prop '${key}'`);
    	});

    	function input_value_binding(value) {
    		tag = value;
    		$$invalidate(0, tag);
    	}

    	const keypress_handler = event => {
    		if (event && event.key === "Enter") addTag();
    	};

    	function notification_1_active_binding(value) {
    		notification.showUp = value;
    		$$invalidate(2, notification);
    	}

    	const close_handler = (i, e) => deleteTag(i);

    	$$self.$capture_state = () => ({
    		Field,
    		Input,
    		Tag,
    		Taglist,
    		Button,
    		Notification,
    		Message,
    		Progress,
    		onMount,
    		supabase,
    		tag,
    		tags,
    		notification,
    		isLoading,
    		isLoadingTags,
    		addTag,
    		deleteTag,
    		setnotification,
    		loadTags
    	});

    	$$self.$inject_state = $$props => {
    		if ("tag" in $$props) $$invalidate(0, tag = $$props.tag);
    		if ("tags" in $$props) $$invalidate(1, tags = $$props.tags);
    		if ("notification" in $$props) $$invalidate(2, notification = $$props.notification);
    		if ("isLoading" in $$props) $$invalidate(3, isLoading = $$props.isLoading);
    		if ("isLoadingTags" in $$props) $$invalidate(4, isLoadingTags = $$props.isLoadingTags);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		tag,
    		tags,
    		notification,
    		isLoading,
    		isLoadingTags,
    		addTag,
    		deleteTag,
    		input_value_binding,
    		keypress_handler,
    		notification_1_active_binding,
    		close_handler
    	];
    }

    class AddTags extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddTags",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/main.svelte generated by Svelte v3.31.2 */
    const file$g = "src/main.svelte";

    // (53:6) {#key body}
    function create_key_block(ctx) {
    	let div;
    	let switch_instance;
    	let div_transition;
    	let current;
    	var switch_value = /*body*/ ctx[0];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			add_location(div, file$g, 53, 8, 1417);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*body*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(53:6) {#key body}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let nav;
    	let div0;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let section;
    	let aside;
    	let p0;
    	let t1;
    	let p1;
    	let t3;
    	let ul;
    	let li0;
    	let a1;
    	let span0;
    	let i0;
    	let t4;
    	let t5;
    	let li1;
    	let a2;
    	let span1;
    	let i1;
    	let t6;
    	let t7;
    	let div2;
    	let div1;
    	let previous_key = /*body*/ ctx[0];
    	let current;
    	let mounted;
    	let dispose;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div0 = element("div");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			section = element("section");
    			aside = element("aside");
    			p0 = element("p");
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Managment";
    			t3 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			span0 = element("span");
    			i0 = element("i");
    			t4 = text("\n          Adding Tests & Questions");
    			t5 = space();
    			li1 = element("li");
    			a2 = element("a");
    			span1 = element("span");
    			i1 = element("i");
    			t6 = text("\n          Adding Tags");
    			t7 = space();
    			div2 = element("div");
    			div1 = element("div");
    			key_block.c();
    			if (img.src !== (img_src_value = "/bambo meeting logo - zaki.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Logo");
    			attr_dev(img, "width", "112");
    			attr_dev(img, "height", "28");
    			add_location(img, file$g, 13, 6, 384);
    			attr_dev(a0, "class", "navbar-item");
    			attr_dev(a0, "href", "/");
    			add_location(a0, file$g, 12, 4, 345);
    			attr_dev(div0, "class", "navbar-brand");
    			add_location(div0, file$g, 11, 2, 314);
    			attr_dev(nav, "class", "navbar is-dark");
    			attr_dev(nav, "role", "navigation");
    			attr_dev(nav, "aria-label", "main navigation");
    			add_location(nav, file$g, 10, 0, 236);
    			attr_dev(p0, "class", "mb-6");
    			add_location(p0, file$g, 26, 4, 703);
    			attr_dev(p1, "class", "menu-label has-text-white-ter");
    			add_location(p1, file$g, 27, 4, 726);
    			attr_dev(i0, "class", "fa fa-plus");
    			add_location(i0, file$g, 34, 30, 962);
    			attr_dev(span0, "class", "icon");
    			add_location(span0, file$g, 34, 10, 942);
    			attr_dev(a1, "href", "##");
    			attr_dev(a1, "class", "has-text-white-ter");
    			add_location(a1, file$g, 30, 8, 827);
    			add_location(li0, file$g, 29, 6, 814);
    			attr_dev(i1, "class", "fa fa-plus");
    			add_location(i1, file$g, 43, 30, 1209);
    			attr_dev(span1, "class", "icon");
    			add_location(span1, file$g, 43, 10, 1189);
    			attr_dev(a2, "href", "##");
    			attr_dev(a2, "class", "has-text-white-ter");
    			add_location(a2, file$g, 39, 8, 1074);
    			add_location(li1, file$g, 38, 6, 1061);
    			attr_dev(ul, "class", "menu-list");
    			add_location(ul, file$g, 28, 4, 785);
    			attr_dev(aside, "class", "menu column is-2 has-background-dark");
    			add_location(aside, file$g, 25, 2, 646);
    			attr_dev(div1, "class", "section");
    			add_location(div1, file$g, 51, 4, 1369);
    			attr_dev(div2, "class", "container column is-10");
    			add_location(div2, file$g, 50, 2, 1328);
    			attr_dev(section, "class", "main-content columns is-fullheight");
    			set_style(section, "min-height", "100%");
    			add_location(section, file$g, 23, 0, 548);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, aside);
    			append_dev(aside, p0);
    			append_dev(aside, t1);
    			append_dev(aside, p1);
    			append_dev(aside, t3);
    			append_dev(aside, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(a1, span0);
    			append_dev(span0, i0);
    			append_dev(a1, t4);
    			append_dev(ul, t5);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(a2, span1);
    			append_dev(span1, i1);
    			append_dev(a2, t6);
    			append_dev(section, t7);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			key_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(a1, "click", /*click_handler*/ ctx[1], false, false, false),
    					listen_dev(a2, "click", /*click_handler_1*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*body*/ 1 && safe_not_equal(previous_key, previous_key = /*body*/ ctx[0])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(div1, null);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    			key_block.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Main", slots, []);
    	let body = AddData; // by default;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, body = AddData);
    	const click_handler_1 = () => $$invalidate(0, body = AddTags);
    	$$self.$capture_state = () => ({ slide, AddData, AddTags, body });

    	$$self.$inject_state = $$props => {
    		if ("body" in $$props) $$invalidate(0, body = $$props.body);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [body, click_handler, click_handler_1];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    const app = new Main({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
