import {
	createStartHandler,
	defaultStreamHandler,
	getStartManifest,
} from "@tanstack/solid-start/server";

import { createRouter } from "./router";

export default createStartHandler({
	createRouter,
	getStartManifest,
})(defaultStreamHandler);
