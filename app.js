// BanglaBank Calculators Application
class BanglaBankCalculators {
  constructor() {
    this.currentPage = "home"
    this.isDarkMode = false
    this.fdrRates = this.getDefaultFDRRates()
    this.customNotes = []
    this.noteCounter = 0
    this.billCounter = 15 // Start with 15 bills as required
    this.init()
  }

  init() {
    this.loadSettings()
    this.setupEventListeners()
    this.setupNoteCalculator()
    this.setupFDRCalculator()
    this.setupLoanCalculator()
    this.setupElectricityBillCounter()
    this.setupSettings()
    this.showPage("home")
  }

  // Default FDR Rates Configuration
  getDefaultFDRRates() {
    return {
      "1month": [
        { min: 0, max: 1000000, rate: 4.0 },
        { min: 1000000, max: 5000000, rate: 4.25 },
      ],
      "2month": [
        { min: 0, max: 1000000, rate: 4.5 },
        { min: 1000000, max: 5000000, rate: 4.75 },
      ],
      "3month": [
        { min: 0, max: 1000000, rate: 8.5 },
        { min: 1000000, max: 5000000, rate: 8.75 },
      ],
      "75days": [{ min: 0, max: Number.POSITIVE_INFINITY, rate: 8.5 }],
      "100days": [{ min: 0, max: 1000000, rate: 8.75 }],
      "6months": [
        { min: 0, max: 1000000, rate: 8.75 },
        { min: 1000000, max: 5000000, rate: 9.0 },
        { min: 5000000, max: 10000000, rate: 9.5 },
      ],
      mis1year: [{ min: 0, max: Number.POSITIVE_INFINITY, rate: 10.8 }],
      mis3year: [{ min: 0, max: Number.POSITIVE_INFINITY, rate: 10.2 }],
      mis5year: [{ min: 0, max: Number.POSITIVE_INFINITY, rate: 9.9 }],
    }
  }

  // Event Listeners Setup
  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const page = link.getAttribute("data-page")
        this.showPage(page)
      })
    })

    // Calculator cards navigation
    document.querySelectorAll(".calculator-card").forEach((card) => {
      card.addEventListener("click", () => {
        const page = card.getAttribute("data-page")
        this.showPage(page)
      })
    })

    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme()
    })
  }

  // Page Navigation
  showPage(pageId) {
    // Update navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active")
      if (link.getAttribute("data-page") === pageId) {
        link.classList.add("active")
      }
    })

    // Show page
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.remove("active")
    })
    document.getElementById(pageId).classList.add("active")

    this.currentPage = pageId
  }

  // Theme Toggle
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode
    document.body.classList.toggle("dark", this.isDarkMode)

    const icon = document.querySelector("#themeToggle i")
    icon.className = this.isDarkMode ? "fas fa-sun" : "fas fa-moon"

    this.saveSettings()
  }

  // Note Calculator Setup
  setupNoteCalculator() {
    const noteInputs = document.querySelectorAll(".note-input")
    const clearButton = document.getElementById("clearNotes")
    const addCustomNoteButton = document.getElementById("addCustomNote")

    noteInputs.forEach((input) => {
      input.addEventListener("input", () => {
        this.formatInputWithCommas(input)
        this.calculateNotes()
      })
    })

    clearButton.addEventListener("click", () => {
      this.clearNotes()
    })

    addCustomNoteButton.addEventListener("click", () => {
      this.addCustomNote()
    })
  }

  addCustomNote() {
    const denomination = prompt("Enter custom note denomination (e.g., 2000, 25, etc.):")
    if (denomination && !isNaN(denomination) && Number(denomination) > 0) {
      const noteValue = Number(denomination)

      // Check if denomination already exists
      const existingNote = document.getElementById(`note${noteValue}`)
      if (existingNote) {
        this.showToast("This denomination already exists!", "error")
        return
      }

      this.noteCounter++
      const noteId = `customNote${this.noteCounter}`
      this.customNotes.push({ id: noteId, value: noteValue })

      // Determine which column to add to (alternate between columns)
      const targetColumn = this.noteCounter % 2 === 1 ? "dynamicNotesColumn1" : "dynamicNotesColumn2"
      const container = document.getElementById(targetColumn)

      const noteItem = document.createElement("div")
      noteItem.className = "note-item"
      noteItem.innerHTML = `
        <label for="${noteId}">৳${this.formatNumber(noteValue)} Notes</label>
        <input type="number" id="${noteId}" class="note-input" data-value="${noteValue}">
        <span class="subtotal">৳0</span>
        <button class="btn-remove" onclick="app.removeCustomNote('${noteId}', ${noteValue})">×</button>
      `

      container.appendChild(noteItem)

      // Add event listener to new input
      const newInput = document.getElementById(noteId)
      newInput.addEventListener("input", () => {
        this.formatInputWithCommas(newInput)
        this.calculateNotes()
      })

      this.showToast(`Added ৳${this.formatNumber(noteValue)} denomination!`, "success")
    }
  }

  removeCustomNote(noteId, noteValue) {
    const noteElement = document.getElementById(noteId).parentElement
    noteElement.remove()

    // Remove from custom notes array
    this.customNotes = this.customNotes.filter((note) => note.id !== noteId)

    this.calculateNotes()
    this.showToast(`Removed ৳${this.formatNumber(noteValue)} denomination!`, "success")
  }

  calculateNotes() {
    const denominations = [1000, 500, 200, 100, 50, 20, 10]
    let total = 0
    const breakdown = []

    // Calculate standard denominations
    denominations.forEach((denom) => {
      const input = document.getElementById(`note${denom}`)
      const count = Number.parseInt(input.value.replace(/,/g, "")) || 0
      const subtotal = count * denom

      // Update subtotal display with comma formatting
      const subtotalSpan = input.parentElement.querySelector(".subtotal")
      subtotalSpan.textContent = `৳${this.formatNumber(subtotal)}`

      total += subtotal

      if (count > 0) {
        breakdown.push(`${this.formatNumber(count)} × ৳${denom} = ৳${this.formatNumber(subtotal)}`)
      }
    })

    this.customNotes.forEach((note) => {
      const input = document.getElementById(note.id)
      if (input) {
        const count = Number.parseInt(input.value.replace(/,/g, "")) || 0
        const subtotal = count * note.value

        // Update subtotal display
        const subtotalSpan = input.parentElement.querySelector(".subtotal")
        subtotalSpan.textContent = `৳${this.formatNumber(subtotal)}`

        total += subtotal

        if (count > 0) {
          breakdown.push(`${this.formatNumber(count)} × ৳${note.value} = ৳${this.formatNumber(subtotal)}`)
        }
      }
    })

    // Update total display with comma formatting
    document.getElementById("totalAmount").textContent = `৳${this.formatNumber(total)}`
    document.getElementById("noteBreakdown").innerHTML = breakdown.join("<br>")
  }

  clearNotes() {
    document.querySelectorAll(".note-input").forEach((input) => {
      // Set input values to empty string instead of "0"
      input.value = ""
    })
    this.calculateNotes()
  }

  // FDR Calculator Setup
  setupFDRCalculator() {
    const fdrForm = document.getElementById("fdrForm")
    const fdrTypeSelect = document.getElementById("fdrType")
    const depositAmountInput = document.getElementById("depositAmount")
    const interestRateInput = document.getElementById("interestRate")

    // Add input formatting for deposit amount
    depositAmountInput.addEventListener("input", () => {
      this.formatInputWithCommas(depositAmountInput)
      this.updateFDRRate()
      this.updateAmountInWords(depositAmountInput, "depositAmountWords")
    })

    fdrTypeSelect.addEventListener("change", () => {
      this.updateFDRRate()
    })

    fdrForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.calculateFDR()
    })
  }

  updateFDRRate() {
    const fdrType = document.getElementById("fdrType").value
    const depositAmount = Number.parseFloat(document.getElementById("depositAmount").value.replace(/,/g, "")) || 0

    if (fdrType && depositAmount > 0) {
      const rate = this.getFDRRate(fdrType, depositAmount)
      document.getElementById("interestRate").value = rate.toFixed(2)
    } else {
      document.getElementById("interestRate").value = ""
    }
  }

  getFDRRate(fdrType, amount) {
    const rates = this.fdrRates[fdrType]
    if (!rates) return 0

    for (const rate of rates) {
      if (amount > rate.min && amount <= rate.max) {
        return rate.rate
      }
    }

    // If amount exceeds all ranges, return the highest rate
    return rates[rates.length - 1].rate
  }

  getFDRTermInYears(fdrType) {
    const termMap = {
      "1month": 1 / 12,
      "2month": 2 / 12,
      "3month": 3 / 12,
      "75days": 75 / 365,
      "100days": 100 / 365,
      "6months": 6 / 12,
      mis1year: 1,
      mis3year: 3,
      mis5year: 5,
    }
    return termMap[fdrType] || 1
  }

  calculateFDR() {
    const fdrType = document.getElementById("fdrType").value
    const depositAmount = Number.parseFloat(document.getElementById("depositAmount").value.replace(/,/g, ""))
    const interestRate = Number.parseFloat(document.getElementById("interestRate").value)

    const incomeTaxSelect = document.getElementById("incomeTax")

    if (!fdrType || !depositAmount || !interestRate) {
      this.showToast("Please fill all required fields", "error")
      return
    }

    if (!incomeTaxSelect.value) {
      this.showToast("Please select an income tax option", "error")
      return
    }

    const incomeTax = incomeTaxSelect.value
    const taxRate = incomeTax === "yes" ? 10 : 15
    const termInYears = this.getFDRTermInYears(fdrType)

    // Calculate profits
    const annualProfit = depositAmount * (interestRate / 100)
    const totalProfitBeforeTax = annualProfit * termInYears
    const monthlyProfitBeforeTax = annualProfit / 12

    const taxAmount = totalProfitBeforeTax * (taxRate / 100)
    const totalProfitAfterTax = totalProfitBeforeTax - taxAmount
    const monthlyProfitAfterTax = monthlyProfitBeforeTax * (1 - taxRate / 100)

    const grandProfitAfterTax = depositAmount + totalProfitAfterTax

    // Display results with comma formatting
    document.getElementById("monthlyProfitBeforeTax").textContent = `৳${this.formatNumber(monthlyProfitBeforeTax)}`
    document.getElementById("totalProfitBeforeTax").textContent = `৳${this.formatNumber(totalProfitBeforeTax)}`
    document.getElementById("monthlyProfitAfterTax").textContent = `৳${this.formatNumber(monthlyProfitAfterTax)}`
    document.getElementById("totalProfitAfterTax").textContent = `৳${this.formatNumber(totalProfitAfterTax)}`
    document.getElementById("grandProfitAfterTax").textContent = `৳${this.formatNumber(grandProfitAfterTax)}`

    const details = `Calculation: Annual Rate ${interestRate}%, Term ${termInYears} years, Tax Rate ${taxRate}% (${incomeTax === "yes" ? "TIN Holder" : "Non-TIN Holder"})`
    document.getElementById("calculationDetails").textContent = details

    document.getElementById("fdrResults").style.display = "block"
  }

  // Loan Calculator Setup
  setupLoanCalculator() {
    const loanForm = document.getElementById("loanForm")
    const loanAmountInput = document.getElementById("loanAmount")
    const processingFeeInput = document.getElementById("processingFee")

    // Add input formatting for loan amount and processing fee
    loanAmountInput.addEventListener("input", () => {
      this.formatInputWithCommas(loanAmountInput)
      this.updateAmountInWords(loanAmountInput, "loanAmountWords")
    })

    processingFeeInput.addEventListener("input", () => {
      this.formatInputWithCommas(processingFeeInput)
    })

    loanForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.calculateLoan()
    })
  }

  calculateLoan() {
    const loanAmount = Number.parseFloat(document.getElementById("loanAmount").value.replace(/,/g, ""))
    const annualRate = Number.parseFloat(document.getElementById("interestRateLoan").value)
    const period = Number.parseInt(document.getElementById("loanPeriod").value)
    const periodType = document.getElementById("periodType").value
    const processingFee = Number.parseFloat(document.getElementById("processingFee").value.replace(/,/g, "")) || 0

    if (!loanAmount || !annualRate || !period) {
      this.showToast("Please fill all required fields", "error")
      return
    }

    // Convert to months
    const totalMonths = periodType === "years" ? period * 12 : period
    const monthlyRate = annualRate / 100 / 12

    // Calculate EMI using standard formula
    const emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)

    const totalPayment = emi * totalMonths
    const totalInterest = totalPayment - loanAmount
    const grandTotal = totalPayment + processingFee

    // Display results with comma formatting
    document.getElementById("monthlyEMI").textContent = `৳${this.formatNumber(emi)}`
    document.getElementById("totalPayment").textContent = `৳${this.formatNumber(totalPayment)}`
    document.getElementById("totalInterest").textContent = `৳${this.formatNumber(totalInterest)}`
    document.getElementById("processingFeeDisplay").textContent = `৳${this.formatNumber(processingFee)}`
    document.getElementById("grandTotal").textContent = `৳${this.formatNumber(grandTotal)}`

    // Show calculation details
    const details = `EMI Formula: P×r×(1+r)^n/((1+r)^n-1) where P=${this.formatNumber(loanAmount)}, r=${monthlyRate.toFixed(6)}, n=${totalMonths}`
    document.getElementById("loanCalculationDetails").textContent = details

    document.getElementById("loanResults").style.display = "block"
  }

  // Settings Setup
  setupSettings() {
    this.renderRateSettings()

    document.getElementById("saveSettings").addEventListener("click", () => {
      this.saveRateSettings()
    })

    document.getElementById("resetSettings").addEventListener("click", () => {
      this.resetRateSettings()
    })

    document.getElementById("exportSettings").addEventListener("click", () => {
      this.exportSettings()
    })

    document.getElementById("importSettingsBtn").addEventListener("click", () => {
      document.getElementById("importSettings").click()
    })

    document.getElementById("importSettings").addEventListener("change", (e) => {
      this.importSettings(e.target.files[0])
    })
  }

  renderRateSettings() {
    const container = document.getElementById("rateSettings")
    container.innerHTML = ""

    const fdrTypes = {
      "1month": "1 Month",
      "2month": "2 Month",
      "3month": "3 Month",
      "75days": "75 Days",
      "100days": "100 Days",
      "6months": "6 Months",
      mis1year: "MIS 1 Year",
      mis3year: "MIS 3 Year",
      mis5year: "MIS 5 Years",
    }

    Object.entries(fdrTypes).forEach(([key, label]) => {
      const rates = this.fdrRates[key]

      rates.forEach((rate, index) => {
        const rateItem = document.createElement("div")
        rateItem.className = "rate-item"

        const rangeText =
          rate.max === Number.POSITIVE_INFINITY
            ? `${label} (Above ৳${this.formatNumber(rate.min)})`
            : `${label} (৳${this.formatNumber(rate.min)} - ৳${this.formatNumber(rate.max)})`

        rateItem.innerHTML = `
                    <label>${rangeText}</label>
                    <input type="number" step="0.01" value="${rate.rate}" 
                           data-type="${key}" data-index="${index}">
                `

        container.appendChild(rateItem)
      })
    })
  }

  saveRateSettings() {
    const inputs = document.querySelectorAll("#rateSettings input")

    inputs.forEach((input) => {
      const type = input.getAttribute("data-type")
      const index = Number.parseInt(input.getAttribute("data-index"))
      const value = Number.parseFloat(input.value)

      if (this.fdrRates[type] && this.fdrRates[type][index]) {
        this.fdrRates[type][index].rate = value
      }
    })

    this.saveSettings()
    this.showToast("Settings saved successfully!", "success")
  }

  resetRateSettings() {
    this.fdrRates = this.getDefaultFDRRates()
    this.renderRateSettings()
    this.saveSettings()
    this.showToast("Settings reset to default!", "success")
  }

  exportSettings() {
    const settings = {
      fdrRates: this.fdrRates,
      isDarkMode: this.isDarkMode,
      customNotes: this.customNotes,
      noteCounter: this.noteCounter,
      billCounter: this.billCounter,
    }

    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const link = document.createElement("a")
    link.href = URL.createObjectURL(dataBlob)
    link.download = "banglabank-settings.json"
    link.click()
  }

  importSettings(file) {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result)

        if (settings.fdrRates) {
          this.fdrRates = settings.fdrRates
          this.renderRateSettings()
        }

        if (settings.isDarkMode !== undefined) {
          this.isDarkMode = settings.isDarkMode
          document.body.classList.toggle("dark", this.isDarkMode)
          const icon = document.querySelector("#themeToggle i")
          icon.className = this.isDarkMode ? "fas fa-sun" : "fas fa-moon"
        }

        if (settings.customNotes) {
          this.customNotes = settings.customNotes
          this.noteCounter = settings.noteCounter || 0
          // Restore custom notes on page load
          setTimeout(() => this.restoreCustomNotes(), 100)
        }

        if (settings.billCounter !== undefined) {
          this.billCounter = settings.billCounter
          // Restore bill inputs on page load
          setTimeout(() => this.generateBillInputs(), 100)
        }

        this.saveSettings()
        this.showToast("Settings imported successfully!", "success")
      } catch (error) {
        this.showToast("Error importing settings!", "error")
      }
    }
    reader.readAsText(file)
  }

  restoreCustomNotes() {
    this.customNotes.forEach((note, index) => {
      const targetColumn = (index + 1) % 2 === 1 ? "dynamicNotesColumn1" : "dynamicNotesColumn2"
      const container = document.getElementById(targetColumn)

      if (container) {
        const noteItem = document.createElement("div")
        noteItem.className = "note-item"
        noteItem.innerHTML = `
          <label for="${note.id}">৳${this.formatNumber(note.value)} Notes</label>
          <input type="number" id="${note.id}" class="note-input" data-value="${note.value}">
          <span class="subtotal">৳0</span>
          <button class="btn-remove" onclick="app.removeCustomNote('${note.id}', ${note.value})">×</button>
        `

        container.appendChild(noteItem)

        // Add event listener to restored input
        const restoredInput = document.getElementById(note.id)
        restoredInput.addEventListener("input", () => {
          this.formatInputWithCommas(restoredInput)
          this.calculateNotes()
        })
      }
    })
  }

  setupElectricityBillCounter() {
    // Generate initial 15 bill inputs
    this.generateBillInputs()

    const addBillBtn = document.getElementById("addBillBtn")
    const clearAllBillsBtn = document.getElementById("clearAllBills")
    const receivedAmountInput = document.getElementById("receivedAmount")
    const bankChargeInput = document.getElementById("bankCharge")

    addBillBtn.addEventListener("click", () => {
      this.addNewBill()
    })

    clearAllBillsBtn.addEventListener("click", () => {
      this.clearAllBills()
    })

    receivedAmountInput.addEventListener("input", () => {
      this.formatInputWithCommas(receivedAmountInput)
      this.calculateCustomerPayment()
    })

    bankChargeInput.addEventListener("input", () => {
      this.formatInputWithCommas(bankChargeInput)
      this.calculateCustomerPayment()
    })
  }

  generateBillInputs() {
    const container = document.getElementById("billInputs")
    container.innerHTML = ""

    for (let i = 1; i <= this.billCounter; i++) {
      const billItem = document.createElement("div")
      billItem.className = "bill-item"
      billItem.innerHTML = `
        <label for="bill${i}">Bill ${i}</label>
        <input type="text" id="bill${i}" class="bill-input" data-bill-number="${i}">
      `
      container.appendChild(billItem)

      // Add event listener to new input
      const billInput = document.getElementById(`bill${i}`)
      billInput.addEventListener("input", () => {
        this.formatInputWithCommas(billInput)
        this.calculateTotalBill()
      })
    }
  }

  addNewBill() {
    this.billCounter++
    const container = document.getElementById("billInputs")

    const billItem = document.createElement("div")
    billItem.className = "bill-item"
    billItem.innerHTML = `
      <label for="bill${this.billCounter}">Bill ${this.billCounter}</label>
      <input type="text" id="bill${this.billCounter}" class="bill-input" data-bill-number="${this.billCounter}">
    `
    container.appendChild(billItem)

    // Add event listener to new input
    const billInput = document.getElementById(`bill${this.billCounter}`)
    billInput.addEventListener("input", () => {
      this.formatInputWithCommas(billInput)
      this.calculateTotalBill()
    })

    this.showToast(`Added Bill ${this.billCounter}!`, "success")
  }

  calculateTotalBill() {
    let total = 0
    const billInputs = document.querySelectorAll(".bill-input[data-bill-number]")

    billInputs.forEach((input) => {
      const value = Number.parseFloat(input.value.replace(/,/g, "")) || 0
      total += value
    })

    document.getElementById("totalBillAmount").textContent = `৳${this.formatNumber(total)}`
    this.calculateCustomerPayment()
  }

  calculateCustomerPayment() {
    const totalBillAmount =
      Number.parseFloat(document.getElementById("totalBillAmount").textContent.replace(/[৳,]/g, "")) || 0
    const receivedAmount = Number.parseFloat(document.getElementById("receivedAmount").value.replace(/,/g, "")) || 0
    const bankCharge = Number.parseFloat(document.getElementById("bankCharge").value.replace(/,/g, "")) || 0

    // Customer Payment = Received Amount - Total Bill Amount - Bank Charge
    const customerPayment = receivedAmount - totalBillAmount - bankCharge
    const customerPaymentElement = document.getElementById("customerPaymentAmount")

    if (customerPayment > 0) {
      // Customer should receive money (positive amount in green)
      customerPaymentElement.textContent = `৳${this.formatNumber(customerPayment)}`
      customerPaymentElement.className = "amount-display customer-payment-positive"
    } else if (customerPayment < 0) {
      // Customer owes money (negative amount in red with minus sign)
      customerPaymentElement.textContent = `-৳${this.formatNumber(Math.abs(customerPayment))}`
      customerPaymentElement.className = "amount-display customer-payment-negative"
    } else {
      // Exact amount
      customerPaymentElement.textContent = `৳${this.formatNumber(customerPayment)}`
      customerPaymentElement.className = "amount-display"
    }
  }

  clearAllBills() {
    // Clear all bill inputs
    const billInputs = document.querySelectorAll(".bill-input[data-bill-number]")
    billInputs.forEach((input) => {
      input.value = ""
    })

    // Clear received amount and bank charge
    document.getElementById("receivedAmount").value = ""
    document.getElementById("bankCharge").value = ""

    // Reset calculations
    document.getElementById("totalBillAmount").textContent = "৳0"
    document.getElementById("customerPaymentAmount").textContent = "৳0"
    document.getElementById("customerPaymentAmount").className = "amount-display"

    this.showToast("All bills cleared!", "success")
  }

  // Utility Functions
  formatNumber(num) {
    if (isNaN(num)) return "0"
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num)
  }

  formatInputWithCommas(input) {
    const value = input.value.replace(/,/g, "")
    if (value && !isNaN(value)) {
      input.value = this.formatNumber(Number.parseFloat(value))
    }
  }

  numberToWords(num) {
    if (num === 0) return "Zero"

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"]
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    function convertHundreds(n) {
      let result = ""
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " Hundred "
        n %= 100
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + " "
        n %= 10
      } else if (n >= 10) {
        result += teens[n - 10] + " "
        return result
      }
      if (n > 0) {
        result += ones[n] + " "
      }
      return result
    }

    if (num < 0) return "Negative " + this.numberToWords(-num)
    if (num < 1000) return convertHundreds(num).trim()
    if (num < 100000) return convertHundreds(Math.floor(num / 1000)) + "Thousand " + convertHundreds(num % 1000)
    if (num < 10000000) return convertHundreds(Math.floor(num / 100000)) + "Lakh " + this.numberToWords(num % 100000)
    return convertHundreds(Math.floor(num / 10000000)) + "Crore " + this.numberToWords(num % 10000000)
  }

  updateAmountInWords(input, displayId) {
    const displayElement = document.getElementById(displayId)
    const value = Number.parseFloat(input.value.replace(/,/g, "")) || 0

    if (value > 0) {
      displayElement.textContent = `In words: ${this.numberToWords(value)} Taka Only`
      displayElement.classList.remove("hidden")
    } else {
      displayElement.classList.add("hidden")
    }
  }

  showToast(message, type = "success") {
    const toast = document.createElement("div")
    toast.className = `toast ${type}`
    toast.textContent = message

    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add("show")
    }, 100)

    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
  }

  // Local Storage Functions
  saveSettings() {
    const settings = {
      fdrRates: this.fdrRates,
      isDarkMode: this.isDarkMode,
      customNotes: this.customNotes,
      noteCounter: this.noteCounter,
      billCounter: this.billCounter,
    }
    localStorage.setItem("banglaBankSettings", JSON.stringify(settings))
  }

  loadSettings() {
    const saved = localStorage.getItem("banglaBankSettings")
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        if (settings.fdrRates) {
          this.fdrRates = settings.fdrRates
        }
        if (settings.isDarkMode) {
          this.isDarkMode = settings.isDarkMode
          document.body.classList.toggle("dark", this.isDarkMode)
          const icon = document.querySelector("#themeToggle i")
          icon.className = this.isDarkMode ? "fas fa-sun" : "fas fa-moon"
        }
        if (settings.customNotes) {
          this.customNotes = settings.customNotes
          this.noteCounter = settings.noteCounter || 0
          // Restore custom notes on page load
          setTimeout(() => this.restoreCustomNotes(), 100)
        }
        if (settings.billCounter !== undefined) {
          this.billCounter = settings.billCounter
          // Restore bill inputs on page load
          setTimeout(() => this.generateBillInputs(), 100)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }
  }
}

let app

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  app = new BanglaBankCalculators()
})

// Input validation helper
function validateInput(input, min = 0, max = Number.POSITIVE_INFINITY) {
  const value = Number.parseFloat(input.value)
  if (isNaN(value) || value < min || value > max) {
    input.classList.add("input-error")
    return false
  } else {
    input.classList.remove("input-error")
    return true
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    // Skip validation for note calculator inputs to allow unlimited values
    if (!input.classList.contains("note-input")) {
      input.addEventListener("blur", () => {
        validateInput(input)
      })
    }
  })
})
