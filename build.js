#!/usr/bin/env node
'use strict'
require('dotenv').config()

const { resolve } = require('path')
const { writeFile, readFile } = require('fs').promises
const sass = require('rosid-handler-sass')
const js = require('rosid-handler-js-next')

const html = require('./src/ui/index')
const isDemoMode = require('./src/utils/isDemoMode')
const isDevelopmentMode = require('./src/utils/isDevelopmentMode')
const customTracker = require('./src/utils/customTracker')
const signale = require('./src/utils/signale')

const index = async () => {

	const data = html()

	return data

}

const favicon = async () => {

	const filePath = resolve(__dirname, 'src/ui/images/favicon.ico')
	const data = readFile(filePath)

	return data

}

const styles = async () => {

	const filePath = resolve(__dirname, 'src/ui/styles/index.scss')
	const data = sass(filePath, { optimize: isDevelopmentMode === false })

	return data

}

const scripts = async () => {

	const filePath = resolve(__dirname, 'src/ui/scripts/index.js')

	const data = js(filePath, {
		optimize: isDevelopmentMode === false,
		replace: {
			'process.env.ACKEE_TRACKER': JSON.stringify(process.env.ACKEE_TRACKER),
			'process.env.ACKEE_DEMO': JSON.stringify(isDemoMode === true ? 'true' : 'false')
		},
		nodeGlobals: isDevelopmentMode === true,
		babel: false
	})

	return data

}

const tracker = async () => {

	const filePath = require.resolve('ackee-tracker')
	const data = readFile(filePath, 'utf8')

	return data

}

const build = async (path, fn) => {

	try {
		signale.await(`Building and writing '${ path }'`)
		const data = await fn()
		await writeFile(path, data)
		signale.success(`Finished building '${ path }'`)
	} catch (err) {
		signale.fatal(err)
		process.exit(1)
	}

}

// Required files
build('dist/index.html', index)
build('dist/favicon.ico', favicon)
build('dist/index.css', styles)
build('dist/index.js', scripts)
build('dist/tracker.js', tracker)

// Optional files
if (customTracker.exists === true) {
	build(`dist/${ customTracker.path }`, tracker)
}