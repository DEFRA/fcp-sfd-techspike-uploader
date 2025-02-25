import { jest, describe, test, expect, beforeEach, beforeAll, afterEach, afterAll } from '@jest/globals'

import hapi from '@hapi/hapi'
import tls from 'node:tls'

const mockAddCACert = jest.fn()
const mockTlsCreateSecureContext = jest.fn()
  .mockReturnValue({ context: { addCACert: mockAddCACert } })

jest.mock('hapi-pino', () => ({
  register: (server) => {
    server.decorate('server', 'logger', {
      info: jest.fn(),
      error: jest.fn()
    })
  },
  name: 'mock-hapi-pino'
}))

const { config } = await import('../../../../../../src/config/index.js')
const { secureContext } = await import('../../../../../../src/api/common/helpers/secure-context/index.js')
const { requestLogger } = await import('../../../../../../src/api/common/helpers/logging/request-logger.js')

describe('#secureContext', () => {
  let server

  describe('When secure context is disabled', () => {
    beforeEach(async () => {
      config.set('isSecureContextEnabled', false)
      server = hapi.server()
      await server.register([requestLogger, secureContext])
    })

    afterEach(async () => {
      config.set('isSecureContextEnabled', false)
      await server.stop({ timeout: 0 })
    })

    test('secureContext decorator should not be available', () => {
      expect(server.logger.info).toHaveBeenCalledWith(
        'Custom secure context is disabled'
      )
    })

    test('Logger should give us disabled message', () => {
      expect(server.secureContext).toBeUndefined()
    })
  })

  describe('When secure context is enabled', () => {
    const PROCESS_ENV = process.env

    const createSecureContextSpy = jest.spyOn(tls, 'createSecureContext')
      .mockImplementation(mockTlsCreateSecureContext)

    beforeAll(() => {
      process.env = { ...PROCESS_ENV }
      process.env.TRUSTSTORE_ONE = 'mock-trust-store-cert-one'
    })

    beforeEach(async () => {
      config.set('isSecureContextEnabled', true)
      server = hapi.server()
      await server.register([requestLogger, secureContext])
    })

    afterEach(async () => {
      config.set('isSecureContextEnabled', false)
      await server.stop({ timeout: 0 })
    })

    afterAll(() => {
      process.env = PROCESS_ENV
      createSecureContextSpy.mockRestore()
    })

    test('Original tls.createSecureContext should have been called', () => {
      expect(mockTlsCreateSecureContext).toHaveBeenCalledWith({})
    })

    test('addCACert should have been called', () => {
      expect(mockAddCACert).toHaveBeenCalled()
    })

    test('secureContext decorator should be available', () => {
      expect(server.secureContext).toEqual({
        context: { addCACert: expect.any(Function) }
      })
    })
  })

  describe('When secure context is enabled without TRUSTSTORE_ certs', () => {
    beforeEach(async () => {
      config.set('isSecureContextEnabled', true)
      server = hapi.server()
      await server.register([requestLogger, secureContext])
    })

    afterEach(async () => {
      config.set('isSecureContextEnabled', false)
      await server.stop({ timeout: 0 })
    })

    test('Should log about not finding any TRUSTSTORE_ certs', () => {
      expect(server.logger.info).toHaveBeenCalledWith(
        'Could not find any TRUSTSTORE_ certificates'
      )
    })
  })
})
