import { mapValidationErrors } from '../models'

describe('mapValidationErrors', () => {
  it('mapea loc body.* a claves sin body', () => {
    const result = mapValidationErrors({
      detail: [
        { loc: ['body', 'responsable_apellido_nombre'], msg: 'missing', type: 'value_error' },
        { loc: ['body', 'integrantes', 0, 'apellido'], msg: 'required', type: 'value_error' },
      ]
    })
    expect(result['responsable_apellido_nombre']).toEqual(['missing'])
    expect(result['integrantes.0.apellido']).toEqual(['required'])
  })
})
