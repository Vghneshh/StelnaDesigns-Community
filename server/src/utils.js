function detectFileTypes({ title = '', description = '', softwares = [], files = [] }) {
  const typeMap = {
    'stl': 'STL', 'step': 'STEP', 'stp': 'STEP', 'step / iges': 'STEP',
    'p21': 'STEP', 'iges': 'STEP', 'igs': 'STEP', 'obj': 'OBJ',
    'fbx': 'FBX', 'blend': 'FBX', '3dm': 'OBJ', 'solidworks': 'STEP',
    'sldprt': 'STEP', 'sldasm': 'STEP', 'catia': 'STEP', 'catpart': 'STEP',
    'catproduct': 'STEP', 'fusion': 'STEP', 'f3d': 'STEP', 'freecad': 'STEP',
    'ptc creo': 'STEP', 'creo': 'STEP', 'solid edge': 'STEP', 'inventor': 'STEP',
    'nx': 'STEP', 'siemens': 'STEP', 'parasolid': 'STEP', 'x_t': 'STEP',
    'x_b': 'STEP', 'rendering': null, 'text file': null,
  }
  const found = new Set()
  softwares.forEach(s => {
    const name = s.name?.toLowerCase?.() || ''
    Object.keys(typeMap).forEach(key => {
      if (name.includes(key) && typeMap[key] !== null) found.add(typeMap[key])
    })
  })
  files.forEach(f => {
    let ext = f.fileExtension?.toLowerCase?.() || ''
    if (ext && typeMap[ext] !== undefined && typeMap[ext] !== null) found.add(typeMap[ext])
    if (f.fileName) {
      const match = f.fileName.toLowerCase().match(/\.([a-z0-9]+)$/)
      if (match && typeMap[match[1]] !== undefined && typeMap[match[1]] !== null) found.add(typeMap[match[1]])
    }
  })
  const text = (title + ' ' + description).toLowerCase()
  Object.keys(typeMap).forEach(key => {
    if (text.includes(key) && typeMap[key] !== null) found.add(typeMap[key])
  })
  return Array.from(found)
}

module.exports = { detectFileTypes }
