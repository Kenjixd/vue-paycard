import { mount, enableAutoDestroy, createLocalVue, shallowMount } from '@vue/test-utils'
import VuePaycard from '../../src/components/VuePaycard'
import Form from './form.vue'

enableAutoDestroy(afterEach)

describe('When I create the VuePaycard component', () => {
  const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms))
  const transitionStub = () => ({
    render: function (h) {
      return this.$options._renderChildren
    }
  })
  const createPaycard = (propsData = {}) => {
    return mount(VuePaycard, {
      propsData,
      stubs: {
        transition: transitionStub()
      }
    })
  }
  const createDefaultForm = () => {
    const valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    const localVue = createLocalVue()
    const wrapperPaycard = shallowMount(VuePaycard, {
      propsData: { valueFields },
      localVue
    })
    const div = document.createElement('div')
    div.id = 'form-test'
    document.body.appendChild(div)
    return mount(Form, {
      AsyncComponent: wrapperPaycard,
      localVue,
      propsData: {
        valueFields
      },
      stubs: {
        transition: transitionStub()
      },
      attachTo: div
    })
  }

  it('should add focus and blur listeners to card number/name input of the outside form', async () => {
    const array = ['v-card-number', 'v-card-name']
    for (let index = 0; index < array.length; index++) {
      const id = array[index]
      const wrapperForm = createDefaultForm()
      const paycardData = wrapperForm.vm.$children[0].$data
      expect(paycardData.currentFocus).toBeNull()
      expect(paycardData.isFocused).toBeFalsy()
      expect(paycardData.isCardFlipped).toBeFalsy()
      expect(paycardData.focusElementStyle).toBeNull()
      await timeout(300)
      wrapperForm.find(`#${id}`).trigger('focus')
      await wrapperForm.vm.$nextTick()
      expect(paycardData.focusElementStyle).toBeDefined()
      expect(paycardData.currentFocus).toBe(id)
      expect(paycardData.isFocused).toBeTruthy()
      expect(paycardData.isCardFlipped).toBeFalsy()
      wrapperForm.find(`#${id}`).trigger('blur')
      await wrapperForm.vm.$nextTick()
      expect(paycardData.currentFocus).toBe(id)
      expect(paycardData.isFocused).toBeFalsy()
      expect(paycardData.isCardFlipped).toBeFalsy()
    }
  })

  it('should add focus and blur listeners to card month/year input of the outside form', async () => {
    const array = ['v-card-month', 'v-card-year']
    for (let index = 0; index < array.length; index++) {
      const id = array[index]
      const wrapperForm = createDefaultForm()
      const paycardData = wrapperForm.vm.$children[0].$data
      expect(paycardData.currentFocus).toBeNull()
      expect(paycardData.isFocused).toBeFalsy()
      expect(paycardData.isCardFlipped).toBeFalsy()
      expect(paycardData.focusElementStyle).toBeNull()
      await timeout(300)
      wrapperForm.find(`#${id}`).trigger('focus')
      await wrapperForm.vm.$nextTick()
      expect(paycardData.focusElementStyle).toBeDefined()
      expect(paycardData.currentFocus).toBe('cardDate')
      expect(paycardData.isFocused).toBeTruthy()
      expect(paycardData.isCardFlipped).toBeFalsy()
      wrapperForm.find(`#${id}`).trigger('blur')
      await wrapperForm.vm.$nextTick()
      expect(paycardData.currentFocus).toBe('cardDate')
      expect(paycardData.isFocused).toBeFalsy()
      expect(paycardData.isCardFlipped).toBeFalsy()
    }
  })

  it('should add focus and blur listeners to card cvv input of the outside form', async () => {
    const id = 'v-card-cvv'
    const wrapperForm = createDefaultForm()
    const paycardData = wrapperForm.vm.$children[0].$data
    expect(paycardData.currentFocus).toBeNull()
    expect(paycardData.isFocused).toBeFalsy()
    expect(paycardData.isCardFlipped).toBeFalsy()
    expect(paycardData.focusElementStyle).toBeNull()
    await timeout(300)
    wrapperForm.find(`#${id}`).trigger('focus')
    await wrapperForm.vm.$nextTick()
    expect(paycardData.focusElementStyle).toBeDefined()
    expect(paycardData.currentFocus).toBe(id)
    expect(paycardData.isFocused).toBeTruthy()
    expect(paycardData.isCardFlipped).toBeTruthy()
    wrapperForm.find(`#${id}`).trigger('blur')
    await wrapperForm.vm.$nextTick()
    expect(paycardData.currentFocus).toBe(id)
    expect(paycardData.isFocused).toBeFalsy()
    expect(paycardData.isCardFlipped).toBeFalsy()
  })

  it('should clear currentFocus if blur event from form input is called', async () => {
    const id = 'v-card-number'
    const wrapperForm = createDefaultForm()
    const paycardData = wrapperForm.vm.$children[0].$data
    expect(paycardData.isFocused).toBeFalsy()
    wrapperForm.find(`#${id}`).trigger('blur')
    await wrapperForm.vm.$nextTick()
    expect(paycardData.isFocused).toBeFalsy()
    await timeout(301)
    expect(paycardData.currentFocus).toBeNull()
  })

  it('should clear isFocused if blur event from form input is called', async () => {
    const id = 'v-card-number'
    const wrapperForm = createDefaultForm()
    const paycardData = wrapperForm.vm.$children[0].$data
    expect(paycardData.isFocused).toBeFalsy()
    wrapperForm.find(`#${id}`).trigger('blur')
    await wrapperForm.vm.$nextTick()
    expect(paycardData.isFocused).toBeFalsy()
    // * this test needs improvement because of this manual set
    paycardData.isFocused = true
    await timeout(301)
    expect(paycardData.currentFocus).toBeNull()
  })

  it('should be able to mask numbers if the isCardNumberMasked prop is true', () => {
    // * for now, only the last four digits will be shown
    const valueFields = { cardName: '', cardNumber: '9999 9999 9999 9999', cardMonth: '', cardYear: '', cardCvv: '' }
    const wrapper = createPaycard({ valueFields, isCardNumberMasked: true })
    const elements = wrapper.findAll('.card-item__numberItem')
    expect(elements.exists()).toBe(true)
    const numbers = elements.wrappers.map(it => it.text())
    expect(numbers.length).toBe(19)
    const maskedNumbers = numbers.filter(it => it === '*')
    expect(maskedNumbers.length).toBe(12)
    const unmaskedNumbers = numbers.filter(it => it === '9')
    expect(unmaskedNumbers.length).toBe(4)
    const spaces = numbers.filter(it => it === '')
    expect(spaces.length).toBe(3)
  })

  it('should be able to show all the numbers if the isCardNumberMasked prop is false', () => {
    const valueFields = { cardName: '', cardNumber: '9999 9999 9999 9999', cardMonth: '', cardYear: '', cardCvv: '' }
    const wrapper = createPaycard({ valueFields, isCardNumberMasked: false })
    const elements = wrapper.findAll('.card-item__numberItem')
    expect(elements.exists()).toBe(true)
    const numbers = elements.wrappers.map(it => it.text())
    expect(numbers.length).toBe(19)
    const maskedNumbers = numbers.filter(it => it === '*')
    expect(maskedNumbers.length).toBe(0)
    const unmaskedNumbers = numbers.filter(it => it === '9')
    expect(unmaskedNumbers.length).toBe(16)
    const spaces = numbers.filter(it => it === '')
    expect(spaces.length).toBe(3)
  })

  it('should be able to set a background-image with a link', async () => {
    const valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    const payload = { valueFields }
    const wrapper = createPaycard({ ...payload })
    expect(wrapper.exists()).toBeTruthy()
    const image = 'https://ik.imagekit.io/6xhf1gnexgdgk/lion_BllLvaqVn.jpg'
    await wrapper.setProps({ backgroundImage: image })
    const cover = wrapper.findAll('.card-item__cover')
    expect(cover.exists()).toBe(true)
    const bg = wrapper.find('.card-item__bg')
    expect(bg.exists()).toBe(true)
    expect(bg.attributes().src).toBe(image)
  })

  it('should be able to remove the random background images', () => {
    const valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    const payload = { valueFields, hasRandomBackgrounds: false, backgroundImage: '' }
    const wrapper = createPaycard({ ...payload })
    expect(wrapper.exists()).toBeTruthy()
    const cover = wrapper.findAll('.card-item__cover')
    expect(cover.exists()).toBe(true)
    const bg = wrapper.find('.card-item__bg')
    expect(bg.exists()).toBe(false)
  })

  it('should be able to change all the labels', () => {
    const valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    const labels = { cardName: 'A', cardHolder: 'B', cardMonth: 'XX', cardYear: 'WW', cardExpires: 'C', cardCvv: 'V' }
    const payload = { valueFields, labels }
    const wrapper = createPaycard({ ...payload })
    expect(wrapper.exists()).toBeTruthy()
    const name = wrapper.find('.card-item__name')
    expect(name.exists()).toBe(true)
    expect(name.text()).toBe('A')
    const holder = wrapper.find('.card-item__holder')
    expect(holder.exists()).toBe(true)
    expect(holder.text()).toBe('B')
    const expires = wrapper.find('.card-item__dateTitle')
    expect(expires.exists()).toBe(true)
    expect(expires.text()).toBe('C')
    const month = wrapper.find('[for=v-card-month] > span')
    expect(month.exists()).toBe(true)
    expect(month.text()).toBe('XX')
    const year = wrapper.find('[for=v-card-year] > span')
    expect(year.exists()).toBe(true)
    expect(year.text()).toBe('WW')
    const cvv = wrapper.find('.card-item__cvvTitle')
    expect(cvv.exists()).toBe(true)
    expect(cvv.text()).toBe('V')
  })

  it('should be able to change all the input field ids', () => {
    const valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    const inputFields = { cardName: 'a-1', cardNumber: 'a-2', cardMonth: 'a-3', cardYear: 'a-4', cardCvv: 'a-5' }
    const payload = { valueFields, inputFields }
    const wrapper = createPaycard({ ...payload })
    expect(wrapper.exists()).toBeTruthy()
    const name = wrapper.find('[for=a-1]')
    expect(name.exists()).toBe(true)
    expect(name.text()).toContain('Card Holder')
    const number = wrapper.find('[for=a-2]')
    expect(number.exists()).toBe(true)
    expect(number.text()).toContain('#')
    const month = wrapper.findAll('[for=a-3]')
    expect(month.length).toBe(2)
    expect(month.at(0).exists()).toBe(true)
    expect(month.at(0).text()).toBe('Expires')
    expect(month.at(1).exists()).toBe(true)
    expect(month.at(1).text()).toBe('MM')
    const year = wrapper.find('[for=a-4]')
    expect(year.exists()).toBe(true)
    expect(year.text()).toBe('YY')
    const cvv = wrapper.find('[for=a-5]')
    expect(cvv.exists()).toBe(true)
    expect(cvv.text()).toContain('CVV')
  })

  it('should be able to set all the value fields', async () => {
    const valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    const payload = { valueFields }
    const wrapper = createPaycard({ ...payload })
    expect(wrapper.exists()).toBeTruthy()
    const valueFieldsAfter = { cardName: 'qwerty', cardNumber: '9999 9999 9999 9999', cardMonth: '01', cardYear: '2021', cardCvv: 'ASD' }
    await wrapper.setProps({ valueFields: valueFieldsAfter, isCardNumberMasked: false })
    // * card number
    const elements = wrapper.findAll('.card-item__numberItem')
    expect(elements.exists()).toBe(true)
    const numbers = elements.wrappers.map(it => it.text())
    expect(numbers.length).toBe(19)
    const maskedNumbers = numbers.filter(it => it === '*')
    expect(maskedNumbers.length).toBe(0)
    const unmaskedNumbers = numbers.filter(it => it === '9')
    expect(unmaskedNumbers.length).toBe(16)
    const spaces = numbers.filter(it => it === '')
    expect(spaces.length).toBe(3)
    // * card name
    const elementsNamedItem = wrapper.findAll('.card-item__nameItem')
    expect(elementsNamedItem.exists()).toBe(true)
    const elementsNamedItemText = elementsNamedItem.wrappers.map(it => it.text())
    expect(elementsNamedItemText.length).toBe(6)
    // * card month
    const monthValue = wrapper.find('[for=v-card-month] > span')
    expect(monthValue.exists()).toBe(true)
    expect(monthValue.text()).toBe('01')
    // * card year
    const yearValue = wrapper.find('[for=v-card-year] > span')
    expect(yearValue.exists()).toBe(true)
    expect(yearValue.text()).toBe('21')
    // * card cvv
    const cvvValue = wrapper.find('.card-item__cvvBand > span')
    expect(cvvValue.exists()).toBe(true)
    expect(cvvValue.text()).toBe('ASD')
    // * labels
    const name = wrapper.find('[for=v-card-name]')
    expect(name.exists()).toBe(true)
    expect(name.text()).toContain('Card Holder')
    const number = wrapper.find('[for=v-card-number]')
    expect(number.exists()).toBe(true)
    expect(number.text()).toContain('9')
    const month = wrapper.findAll('[for=v-card-month]')
    expect(month.length).toBe(2)
    expect(month.at(0).exists()).toBe(true)
    expect(month.at(0).text()).toBe('Expires')
    expect(month.at(1).exists()).toBe(true)
    expect(month.at(1).text()).toContain('01')
    const year = wrapper.find('[for=v-card-year]')
    expect(year.exists()).toBe(true)
    expect(year.text()).toContain('21')
    const cvv = wrapper.find('[for=v-card-cvv]')
    expect(cvv.exists()).toBe(true)
    expect(cvv.text()).toContain('CVV')
  })

  it('should be able to change the cards placeholder', async () => {
    const valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    const payload = { valueFields, isCardNumberMasked: true }
    const wrapper = createPaycard({ ...payload })
    expect(wrapper.exists()).toBeTruthy()
    // * card number masked
    let elements = wrapper.findAll('.card-item__numberItem')
    expect(elements.exists()).toBe(true)
    let numbers = elements.wrappers.map(it => it.text())
    expect(numbers.length).toBe(19)
    let maskedNumbers = numbers.filter(it => it === '*')
    expect(maskedNumbers.length).toBe(0)
    let hashNumbers = numbers.filter(it => it === '#')
    expect(hashNumbers.length).toBe(16)
    let unmaskedNumbers = numbers.filter(it => it === '9')
    expect(unmaskedNumbers.length).toBe(0)
    let spaces = numbers.filter(it => it === '')
    expect(spaces.length).toBe(3)
    const valueFieldsAfter = { cardName: 'qwerty', cardNumber: '3437 651651 59999', cardMonth: '01', cardYear: '2021', cardCvv: 'ASD' }
    await wrapper.setProps({ valueFields: valueFieldsAfter, isCardNumberMasked: false })
    // * card number
    elements = wrapper.findAll('.card-item__numberItem')
    expect(elements.exists()).toBe(true)
    numbers = elements.wrappers.map(it => it.text())
    expect(numbers.length).toBe(17)
    maskedNumbers = numbers.filter(it => it === '*')
    expect(maskedNumbers.length).toBe(0)
    hashNumbers = numbers.filter(it => it === '#')
    expect(hashNumbers.length).toBe(0)
    unmaskedNumbers = numbers.filter(it => it === '9')
    expect(unmaskedNumbers.length).toBe(4)
    spaces = numbers.filter(it => it === '')
    expect(spaces.length).toBe(2)
  })

  it('should be able to change the cards placeholder', async () => {
    const valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    const payload = { valueFields, isCardNumberMasked: true }
    const wrapper = createPaycard({ ...payload })
    expect(wrapper.exists()).toBeTruthy()
    // * card number masked with empty values
    let elements = wrapper.findAll('.card-item__numberItem')
    expect(elements.exists()).toBe(true)
    let numbers = elements.wrappers.map(it => it.text())
    expect(numbers.length).toBe(19)
    let maskedNumbers = numbers.filter(it => it === '*')
    expect(maskedNumbers.length).toBe(0)
    let hashNumbers = numbers.filter(it => it === '#')
    expect(hashNumbers.length).toBe(16)
    let unmaskedNumbers = numbers.filter(it => it === '9')
    expect(unmaskedNumbers.length).toBe(0)
    let spaces = numbers.filter(it => it === '')
    expect(spaces.length).toBe(3)
    const valueFieldsAfter = { cardName: 'qwerty', cardNumber: '3437 651651 59999', cardMonth: '01', cardYear: '2021', cardCvv: 'ASD' }
    await wrapper.setProps({ valueFields: valueFieldsAfter, isCardNumberMasked: false })
    // * card number unmasked with values
    elements = wrapper.findAll('.card-item__numberItem')
    expect(elements.exists()).toBe(true)
    numbers = elements.wrappers.map(it => it.text())
    expect(numbers.length).toBe(17)
    maskedNumbers = numbers.filter(it => it === '*')
    expect(maskedNumbers.length).toBe(0)
    hashNumbers = numbers.filter(it => it === '#')
    expect(hashNumbers.length).toBe(0)
    unmaskedNumbers = numbers.filter(it => it === '9')
    expect(unmaskedNumbers.length).toBe(4)
    spaces = numbers.filter(it => it === '')
    expect(spaces.length).toBe(2)
  })

  it('should be remove all input events', () => {
    // * this test needs improvement since it doesn't have any form
    const valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    const wrapper = mount(VuePaycard, {
      propsData: {
        valueFields
      },
      stubs: {
        transition: transitionStub()
      },
      attachTo: document.body
    })
    expect(wrapper.exists()).toBeTruthy()
    const fields = document.querySelectorAll('[data-card-field]')
    expect(fields).toMatchObject({})
    wrapper.destroy()
    expect(wrapper.exists()).toBeFalsy()
  })

  it('should check for each card type/brand', async () => {
    // *  this test needs improvement since require is not working properly, so it's checking the alt property
    let valueFields = { cardName: '', cardNumber: '4111 1111 1111 1111', cardMonth: '', cardYear: '', cardCvv: '' }
    const wrapper = createPaycard({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    let img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('visa')
    valueFields = { cardName: '', cardNumber: '3437 516165 16516', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('amex')
    valueFields = { cardName: '', cardNumber: '5151 1111 1111 1111', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('mastercard')
    valueFields = { cardName: '', cardNumber: '6011 1111 1111 1111', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('discover')
    valueFields = { cardName: '', cardNumber: '62600094752489245', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('unionpay')
    valueFields = { cardName: '', cardNumber: '9792 1111 1111 1111', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('troy')
    valueFields = { cardName: '', cardNumber: '3051 111111 1111', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('dinersclub')
    valueFields = { cardName: '', cardNumber: '3528 9151 6515 6156', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('jcb')
    valueFields = { cardName: '', cardNumber: '6362 9700 0045 7013', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('elo')
    valueFields = { cardName: '', cardNumber: '6759 6498 2643 8453', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('maestro')
    valueFields = { cardName: '', cardNumber: '1533 4210 3478 161', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('uatp')
    valueFields = { cardName: '', cardNumber: '6706 0000 0000 0000', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('laser')
    valueFields = { cardName: '', cardNumber: '6062 8256 6638 5648', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('hipercard')
    valueFields = { cardName: '', cardNumber: '5031 6889 1321 1342', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('aura')
    valueFields = { cardName: '', cardNumber: '5019 6066 8505 1379', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('dankort')
    valueFields = { cardName: '', cardNumber: '2204 1569 8128 9629', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('mir')
    valueFields = { cardName: '', cardNumber: '4913 8185 2881 4543', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('visaelectron')
    valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    await wrapper.setProps({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    img = wrapper.find('.card-item__typeImg')
    expect(img.exists()).toBeFalsy()
  })

  it('should check for background covers from assets', () => {
    // *  this test needs improvement since require is not working properly, so it's checking the aria-label property
    const valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    const wrapper = createPaycard({ valueFields, backgroundImage: 1, hasRandomBackgrounds: false })
    expect(wrapper.exists()).toBeTruthy()
    const covers = wrapper.findAll('.card-item__cover')
    expect(covers.at(0).exists()).toBeTruthy()
    expect(covers.at(0).attributes()['aria-label']).toBe('Image cover')
    expect(covers.at(1).exists()).toBeTruthy()
    expect(covers.at(1).attributes()['aria-label']).toBe('Image cover')
  })

  it('should validate all props', () => {
    const valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    const consoleLog = console.error
    console.error = jest.fn()
    const wrapper = createPaycard({ valueFields })
    const valueFieldsProp = wrapper.vm.$options.props.valueFields
    expect(valueFieldsProp.required).toBeTruthy()
    expect(valueFieldsProp.type).toBe(Object)
    expect(valueFieldsProp.default).toBeUndefined()
    const inputFields = wrapper.vm.$options.props.inputFields
    expect(inputFields.required).toBeFalsy()
    expect(inputFields.type).toBe(Object)
    expect(inputFields.default()).toMatchObject({
      cardNumber: 'v-card-number',
      cardName: 'v-card-name',
      cardMonth: 'v-card-month',
      cardYear: 'v-card-year',
      cardCvv: 'v-card-cvv'
    })
    const labels = wrapper.vm.$options.props.labels
    expect(labels.required).toBeFalsy()
    expect(labels.type).toBe(Object)
    expect(labels.default()).toMatchObject({
      cardName: 'Full Name',
      cardHolder: 'Card Holder',
      cardMonth: 'MM',
      cardYear: 'YY',
      cardExpires: 'Expires',
      cardCvv: 'CVV'
    })
    const isCardNumberMasked = wrapper.vm.$options.props.isCardNumberMasked
    expect(isCardNumberMasked.required).toBeFalsy()
    expect(isCardNumberMasked.type).toBe(Boolean)
    expect(isCardNumberMasked.default).toBe(true)
    const hasRandomBackgrounds = wrapper.vm.$options.props.hasRandomBackgrounds
    expect(hasRandomBackgrounds.required).toBeFalsy()
    expect(hasRandomBackgrounds.type).toBe(Boolean)
    expect(hasRandomBackgrounds.default).toBe(true)
    const backgroundImage = wrapper.vm.$options.props.backgroundImage
    expect(backgroundImage.required).toBeFalsy()
    expect(backgroundImage.type).toContain(Number)
    expect(backgroundImage.type).toContain(String)
    expect(backgroundImage.default).toBe('')
    console.error = consoleLog
  })

  it('expect card type to be emitted on change', async () => {
    const valueFields = {
      cardName: '',
      cardNumber: '',
      cardMonth: '',
      cardYear: '',
      cardCvv: ''
    }
    const wrapper = createPaycard({ valueFields })
    expect(wrapper.exists()).toBeTruthy()
    const valueFieldsAfter = {
      cardName: 'visa test',
      cardNumber: '4242 4242 4242 4242',
      cardMonth: '12',
      cardYear: '2021',
      cardCvv: '123'
    }
    await wrapper.setProps({
      valueFields: valueFieldsAfter
    })
    expect(wrapper.emitted()['get-type'][0]).toEqual(['visa']) // Data is emitted with expected value
  })

  it('should check for set card type', () => {
    // *  this test needs improvement since require is not working properly, so it's checking the aria-label property
    const valueFields = {
      cardName: '',
      cardNumber: '',
      cardMonth: '',
      cardYear: '',
      cardCvv: ''
    }
    const wrapper = createPaycard({
      valueFields,
      setType: 'visa'
    })
    expect(wrapper.exists()).toBeTruthy()
    const img = wrapper.find('.card-item__typeImg')
    expect(img.attributes().alt).toContain('visa')
  })

  it('should match default component snapshot', () => {
    const valueFields = { cardName: '', cardNumber: '', cardMonth: '', cardYear: '', cardCvv: '' }
    const wrapper = createPaycard({ valueFields })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
