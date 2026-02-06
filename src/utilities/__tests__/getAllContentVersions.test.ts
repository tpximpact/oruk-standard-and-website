import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllContentVersions } from '../getAllContentVersions'
import { getSubdirectories } from '../getSubdirectories'
import { getContentVersion } from '../getContentVersion'

vi.mock('../getSubdirectories')
vi.mock('../getContentVersion')

describe('getAllContentVersions', () => {
  const mockGetSubdirectories = vi.mocked(getSubdirectories)
  const mockGetContentVersion = vi.mocked(getContentVersion)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return an empty object when no subdirectories are found', () => {
    mockGetSubdirectories.mockReturnValue([])

    const result = getAllContentVersions({
      contentFolder: 'content',
      specificationFolder: 'specifications'
    })

    expect(result).toEqual({})
    expect(mockGetSubdirectories).toHaveBeenCalledWith('specifications')
    expect(mockGetContentVersion).not.toHaveBeenCalled()
  })

  it('should process a single version directory', () => {
    const versionPath = 'specifications/v1.0'
    const mockVersionData = {
      htmlContent: '<h1>Version 1.0</h1>',
      rootSpec: {
        json: '{}',
        parsed: {}
      },
      schemata: {}
    }

    mockGetSubdirectories.mockReturnValue([versionPath])
    mockGetContentVersion.mockReturnValue(mockVersionData)

    const result = getAllContentVersions({
      contentFolder: 'content',
      specificationFolder: 'specifications'
    })

    expect(result).toEqual({
      'v1.0': mockVersionData
    })
    expect(mockGetSubdirectories).toHaveBeenCalledWith('specifications')
    expect(mockGetContentVersion).toHaveBeenCalledWith({
      contentFolder: 'content',
      specificationFolderPath: versionPath
    })
  })

  it('should process multiple version directories', () => {
    const versionPaths = ['specifications/v1.0', 'specifications/v2.0', 'specifications/v3.0']
    const mockVersionData1 = {
      htmlContent: '<h1>Version 1.0</h1>',
      rootSpec: { json: '{}', parsed: {} },
      schemata: {}
    }
    const mockVersionData2 = {
      htmlContent: '<h1>Version 2.0</h1>',
      rootSpec: { json: '{}', parsed: {} },
      schemata: {}
    }
    const mockVersionData3 = {
      htmlContent: '<h1>Version 3.0</h1>',
      rootSpec: { json: '{}', parsed: {} },
      schemata: {}
    }

    mockGetSubdirectories.mockReturnValue(versionPaths)
    mockGetContentVersion
      .mockReturnValueOnce(mockVersionData1)
      .mockReturnValueOnce(mockVersionData2)
      .mockReturnValueOnce(mockVersionData3)

    const result = getAllContentVersions({
      contentFolder: 'content',
      specificationFolder: 'specifications'
    })

    expect(result).toEqual({
      'v1.0': mockVersionData1,
      'v2.0': mockVersionData2,
      'v3.0': mockVersionData3
    })
    expect(mockGetSubdirectories).toHaveBeenCalledWith('specifications')
    expect(mockGetContentVersion).toHaveBeenCalledTimes(3)
    expect(mockGetContentVersion).toHaveBeenNthCalledWith(1, {
      contentFolder: 'content',
      specificationFolderPath: 'specifications/v1.0'
    })
    expect(mockGetContentVersion).toHaveBeenNthCalledWith(2, {
      contentFolder: 'content',
      specificationFolderPath: 'specifications/v2.0'
    })
    expect(mockGetContentVersion).toHaveBeenNthCalledWith(3, {
      contentFolder: 'content',
      specificationFolderPath: 'specifications/v3.0'
    })
  })

  it('should extract version name from path basename correctly', () => {
    const versionPaths = [
      '/full/path/to/specifications/v1.0',
      '/different/path/specifications/v2.0-beta'
    ]
    const mockVersionData = {
      htmlContent: '',
      rootSpec: { json: '{}', parsed: {} },
      schemata: {}
    }

    mockGetSubdirectories.mockReturnValue(versionPaths)
    mockGetContentVersion.mockReturnValue(mockVersionData)

    const result = getAllContentVersions({
      contentFolder: 'content',
      specificationFolder: 'specifications'
    })

    expect(result).toHaveProperty('v1.0')
    expect(result).toHaveProperty('v2.0-beta')
  })

  it('should handle versions with complex data structures', () => {
    const versionPath = 'specifications/v2.0'
    const mockVersionData = {
      htmlContent: '<h1>Complex Version</h1><p>With content</p>',
      rootSpec: {
        json: JSON.stringify({ openapi: '3.0.0', info: { title: 'API' } }),
        parsed: { openapi: '3.0.0', info: { title: 'API' }, paths: {} }
      },
      schemata: {
        Service: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' }
          }
        },
        Location: {
          type: 'object',
          properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' }
          }
        }
      }
    }

    mockGetSubdirectories.mockReturnValue([versionPath])
    mockGetContentVersion.mockReturnValue(mockVersionData)

    const result = getAllContentVersions({
      contentFolder: 'content',
      specificationFolder: 'specifications'
    })

    expect(result['v2.0']).toEqual(mockVersionData)
    expect(result['v2.0'].schemata).toHaveProperty('Service')
    expect(result['v2.0'].schemata).toHaveProperty('Location')
  })

  it('should pass correct parameters to dependencies', () => {
    const contentFolder = 'custom/content/path'
    const specificationFolder = 'custom/spec/path'
    const versionPath = 'custom/spec/path/v1.0'

    mockGetSubdirectories.mockReturnValue([versionPath])
    mockGetContentVersion.mockReturnValue({
      htmlContent: '',
      rootSpec: { json: '{}', parsed: {} },
      schemata: {}
    })

    getAllContentVersions({
      contentFolder,
      specificationFolder
    })

    expect(mockGetSubdirectories).toHaveBeenCalledWith(specificationFolder)
    expect(mockGetContentVersion).toHaveBeenCalledWith({
      contentFolder,
      specificationFolderPath: versionPath
    })
  })
})
