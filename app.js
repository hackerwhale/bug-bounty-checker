document.addEventListener('DOMContentLoaded', function() {
  // Initialize the app
  const app = new BugBountyChecker();
  app.init();
});

class BugBountyChecker {
  constructor() {
    this.state = {
      selectedInterests: [],
      targetName: '',
      targetUrl: '',
      checkedItems: {},
      showResults: false,
      analysis: null,
      editingChecklist: false,
      newChecklistItem: '',
      customChecklist: []
    };

    this.interests = [
      { id: 'web', name: 'Web Application Security', icon: 'globe', color: 'bg-blue-500' },
      { id: 'api', name: 'API Security', icon: 'code', color: 'bg-green-500' },
      { id: 'mobile', name: 'Mobile App Security', icon: 'smartphone', color: 'bg-purple-500' },
      { id: 'network', name: 'Network Security', icon: 'shield', color: 'bg-red-500' },
      { id: 'cloud', name: 'Cloud Security', icon: 'cloud', color: 'bg-cyan-500' },
      { id: 'iot', name: 'IoT Security', icon: 'zap', color: 'bg-yellow-500' },
      { id: 'crypto', name: 'Cryptography', icon: 'lock', color: 'bg-indigo-500' },
      { id: 'social', name: 'Social Engineering', icon: 'users', color: 'bg-pink-500' },
      { id: 'hardware', name: 'Hardware Security', icon: 'settings', color: 'bg-orange-500' },
      { id: 'database', name: 'Database Security', icon: 'database', color: 'bg-teal-500' },
      { id: 'other', name: 'Other', icon: 'star', color: 'bg-gray-500' }
    ];

    this.defaultChecklist = [
      { id: 'file-upload', text: 'Has file upload functionality', category: 'web', priority: 'high' },
      { id: 'auth-system', text: 'Has authentication system', category: 'web', priority: 'high' },
      { id: 'user-profiles', text: 'Has user profiles/account management', category: 'web', priority: 'medium' },
      { id: 'wildcard-domains', text: 'Offers wildcard subdomains (*.example.com)', category: 'web', priority: 'high' },
      { id: 'wide-scope', text: 'Allows wide scope (multiple subdomains or APIs)', category: 'api', priority: 'high' },
      { id: 'low-hanging-fruit', text: 'Potential for low-hanging fruit (XSS, IDOR, SQLi)', category: 'web', priority: 'medium' },
      { id: 'public-reports', text: 'Public reports available to learn from', category: 'other', priority: 'medium' },
      { id: 'mobile-app', text: 'Has mobile application', category: 'mobile', priority: 'medium' },
      { id: 'api-endpoints', text: 'Has API endpoints', category: 'api', priority: 'high' },
      { id: 'actively-used', text: 'Target is actively used/maintained', category: 'other', priority: 'high' },
      { id: 'decent-rewards', text: 'Offers decent rewards or recognition', category: 'other', priority: 'medium' },
      { id: 'search-functionality', text: 'Has search functionality', category: 'web', priority: 'medium' },
      { id: 'profile-editing', text: 'Has profile editing features', category: 'web', priority: 'medium' },
      { id: 'payment-system', text: 'Has payment/financial features', category: 'web', priority: 'high' },
      { id: 'admin-panels', text: 'Has admin panels or dashboards', category: 'web', priority: 'high' },
      { id: 'third-party-integrations', text: 'Uses third-party integrations', category: 'api', priority: 'medium' },
      { id: 'websockets', text: 'Uses WebSockets or real-time features', category: 'web', priority: 'medium' },
      { id: 'content-management', text: 'Has content management system', category: 'web', priority: 'medium' },
      { id: 'social-features', text: 'Has social features (comments, sharing, etc.)', category: 'social', priority: 'medium' },
      { id: 'cloud-storage', text: 'Uses cloud storage or CDN', category: 'cloud', priority: 'medium' }
    ];

    this.checklist = [...this.defaultChecklist];
  }

  init() {
    this.renderMainView();
    this.setupEventListeners();
  }

  renderMainView() {
    const appElement = document.getElementById('app');
    
    if (this.state.showResults) {
      appElement.innerHTML = this.renderResultsView();
    } else {
      appElement.innerHTML = `
        <div class="space-y-8">
          ${this.renderInterestSelection()}
          ${this.renderTargetInput()}
          ${this.renderEvaluationChecklist()}
          ${this.renderAnalyzeButton()}
        </div>
      `;
    }

    // Reinitialize Lucide icons after rendering
    lucide.createIcons();
  }

  renderInterestSelection() {
    return `
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <i data-lucide="star" class="w-6 h-6 text-yellow-400"></i>
          Select Your Interests
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${this.interests.map(interest => {
            const isSelected = this.state.selectedInterests.includes(interest.id);
            return `
              <button
                id="interest-${interest.id}"
                class="p-4 rounded-lg border-2 transition-all duration-300 ${
                  isSelected 
                    ? 'border-cyan-400 bg-cyan-900/50 text-cyan-400' 
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                }"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg ${interest.color}">
                    <i data-lucide="${interest.icon}" class="w-5 h-5 text-white"></i>
                  </div>
                  <span class="font-medium">${interest.name}</span>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderTargetInput() {
    return `
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <i data-lucide="search" class="w-6 h-6 text-green-400"></i>
          Enter Target Details
        </h2>
        <div class="space-y-4">
          <div>
            <label class="block text-white text-sm font-medium mb-2">Target Name *</label>
            <input
              type="text"
              id="targetName"
              value="${this.state.targetName}"
              placeholder="e.g., Google, Facebook, Your-Target-Company"
              class="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-white text-sm font-medium mb-2">Target URL (Optional)</label>
            <input
              type="url"
              id="targetUrl"
              value="${this.state.targetUrl}"
              placeholder="e.g., https://example.com"
              class="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
    `;
  }

  renderEvaluationChecklist() {
    const filteredChecklist = this.checklist.filter(item => 
      this.state.selectedInterests.includes(item.category) || item.category === 'other'
    );

    return `
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white flex items-center gap-2">
            <i data-lucide="check-circle" class="w-6 h-6 text-green-400"></i>
            Target Evaluation Checklist
          </h2>
          <button
            id="editChecklistBtn"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <i data-lucide="${this.state.editingChecklist ? 'check' : 'edit-3'}" class="w-4 h-4"></i>
            ${this.state.editingChecklist ? 'Done Editing' : 'Edit Checklist'}
          </button>
        </div>

        ${this.state.selectedInterests.length === 0 ? `
          <div class="text-center py-8">
            <i data-lucide="alert-circle" class="w-16 h-16 text-yellow-400 mx-auto mb-4"></i>
            <p class="text-gray-300">Please select your interests first to see relevant checklist items</p>
          </div>
        ` : `
          <div class="space-y-4">
            ${filteredChecklist.map(item => `
              <div id="checklist-item-${item.id}" class="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="checkbox-${item.id}"
                    ${this.state.checkedItems[item.id] ? 'checked' : ''}
                    class="w-5 h-5 text-cyan-400 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <div class="flex-1">
                    <p class="text-white font-medium">${item.text}</p>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="px-2 py-1 rounded-full text-xs priority-${item.priority}">
                        ${item.priority} priority
                      </span>
                      <span class="text-gray-400 text-xs">
                        ${this.interests.find(i => i.id === item.category)?.name || 'General'}
                      </span>
                    </div>
                  </div>
                </div>
                ${this.state.editingChecklist && item.custom ? `
                  <button
                    id="remove-item-${item.id}"
                    class="text-red-400 hover:text-red-300 p-2"
                  >
                    <i data-lucide="x" class="w-4 h-4"></i>
                  </button>
                ` : ''}
              </div>
            `).join('')}

            ${this.state.editingChecklist ? `
              <div class="mt-6 p-4 bg-gray-700 rounded-lg">
                <h3 class="text-white font-medium mb-3">Add Custom Checklist Item</h3>
                <div class="flex gap-3">
                  <input
                    type="text"
                    id="newChecklistItem"
                    value="${this.state.newChecklistItem}"
                    placeholder="Enter your custom checklist item..."
                    class="flex-1 p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    id="addChecklistItemBtn"
                    class="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    Add
                  </button>
                </div>
              </div>
            ` : ''}
          </div>
        `}
      </div>
    `;
  }

  renderAnalyzeButton() {
    const isDisabled = this.state.selectedInterests.length === 0 || !this.state.targetName.trim();
    return `
      <div class="text-center">
        <button
          id="analyzeBtn"
          ${isDisabled ? 'disabled' : ''}
          class="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse"
        >
          Analyze Target Fit
        </button>
      </div>
    `;
  }

  renderResultsView() {
    const analysis = this.state.analysis;
    if (!analysis) return '';

    return `
      <div class="space-y-6">
        <!-- Back Button -->
        <button
          id="backBtn"
          class="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          Back to Analysis
        </button>

        <!-- Analysis Results -->
        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-3xl font-bold text-white">${analysis.targetName}</h2>
            <div class="text-right">
              <div class="text-3xl font-bold text-cyan-400">${analysis.relevantCompletionRate.toFixed(0)}%</div>
              <div class="text-sm text-gray-400">Criteria Match</div>
            </div>
          </div>
          
          ${analysis.targetUrl ? `
            <div class="mb-4">
              <a 
                href="${analysis.targetUrl}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-cyan-400 hover:text-cyan-300 underline"
              >
                ${analysis.targetUrl}
              </a>
            </div>
          ` : ''}

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-gray-700 p-4 rounded-lg">
              <h4 class="font-semibold text-white mb-2">Total Checked</h4>
              <p class="text-green-400">${analysis.relevantCheckedItems.length} / ${analysis.relevantItems.length}</p>
            </div>
            <div class="bg-gray-700 p-4 rounded-lg">
              <h4 class="font-semibold text-white mb-2">Match Rate</h4>
              <p class="text-cyan-400">${analysis.relevantCompletionRate.toFixed(0)}%</p>
            </div>
            <div class="bg-gray-700 p-4 rounded-lg">
              <h4 class="font-semibold text-white mb-2">Priority Score</h4>
              <p class="text-purple-400">${analysis.priorityScore.toFixed(0)}%</p>
            </div>
            <div class="bg-gray-700 p-4 rounded-lg">
              <h4 class="font-semibold text-white mb-2">Interests</h4>
              <p class="text-yellow-400">${analysis.selectedInterests.length}</p>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 class="text-xl font-bold text-white mb-4">Recommendations</h3>
          <div class="space-y-4">
            ${analysis.recommendations.map(rec => `
              <div class="p-4 rounded-lg border-l-4 recommendation-${rec.type}">
                <h4 class="font-semibold mb-2">${rec.title}</h4>
                <p>${rec.message}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Detailed Breakdown -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 class="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
              <i data-lucide="check-circle" class="w-5 h-5"></i>
              Criteria Met (${analysis.relevantCheckedItems.length})
            </h3>
            <div class="space-y-3">
              ${analysis.relevantCheckedItems.map(item => `
                <div class="flex items-center gap-3 p-3 bg-green-900/30 rounded-lg">
                  <i data-lucide="check-circle" class="w-5 h-5 text-green-400"></i>
                  <div>
                    <p class="text-white font-medium">${item.text}</p>
                    <span class="inline-block px-2 py-1 rounded-full text-xs mt-1 priority-${item.priority}">
                      ${item.priority} priority
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 class="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <i data-lucide="x-circle" class="w-5 h-5"></i>
              Missing Criteria (${analysis.relevantItems.length - analysis.relevantCheckedItems.length})
            </h3>
            <div class="space-y-3">
              ${analysis.relevantItems.filter(item => !analysis.relevantCheckedItems.some(ci => ci.id === item.id)).map(item => `
                <div class="flex items-center gap-3 p-3 bg-red-900/30 rounded-lg">
                  <i data-lucide="x-circle" class="w-5 h-5 text-red-400"></i>
                  <div>
                    <p class="text-white font-medium">${item.text}</p>
                    <span class="inline-block px-2 py-1 rounded-full text-xs mt-1 priority-${item.priority}">
                      ${item.priority} priority
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Interest selection
    this.interests.forEach(interest => {
      const button = document.getElementById(`interest-${interest.id}`);
      if (button) {
        button.addEventListener('click', () => {
          this.handleInterestToggle(interest.id);
        });
      }
    });

    // Target input
    const targetNameInput = document.getElementById('targetName');
    if (targetNameInput) {
      targetNameInput.addEventListener('input', (e) => {
        this.setState({ targetName: e.target.value });
      });
    }

    const targetUrlInput = document.getElementById('targetUrl');
    if (targetUrlInput) {
      targetUrlInput.addEventListener('input', (e) => {
        this.setState({ targetUrl: e.target.value });
      });
    }

    // Checklist checkboxes
    this.checklist.forEach(item => {
      const checkbox = document.getElementById(`checkbox-${item.id}`);
      if (checkbox) {
        checkbox.addEventListener('change', () => {
          this.handleChecklistToggle(item.id);
        });
      }
    });

    // Edit checklist button
    const editChecklistBtn = document.getElementById('editChecklistBtn');
    if (editChecklistBtn) {
      editChecklistBtn.addEventListener('click', () => {
        this.setState({ editingChecklist: !this.state.editingChecklist });
      });
    }

    // Add checklist item
    const addChecklistItemBtn = document.getElementById('addChecklistItemBtn');
    if (addChecklistItemBtn) {
      addChecklistItemBtn.addEventListener('click', () => {
        this.addCustomChecklistItem();
      });
    }

    const newChecklistItemInput = document.getElementById('newChecklistItem');
    if (newChecklistItemInput) {
      newChecklistItemInput.addEventListener('input', (e) => {
        this.setState({ newChecklistItem: e.target.value });
      });
      newChecklistItemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addCustomChecklistItem();
        }
      });
    }

    // Remove checklist items
    this.checklist.forEach(item => {
      if (item.custom) {
        const removeBtn = document.getElementById(`remove-item-${item.id}`);
        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            this.removeChecklistItem(item.id);
          });
        }
      }
    });

    // Analyze button
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => {
        this.analyzeTarget();
      });
    }

    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.setState({ showResults: false });
      });
    }
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.renderMainView();
    this.setupEventListeners();
  }

  handleInterestToggle(interestId) {
    this.setState({
      selectedInterests: this.state.selectedInterests.includes(interestId) 
        ? this.state.selectedInterests.filter(id => id !== interestId)
        : [...this.state.selectedInterests, interestId]
    });
  }

  handleChecklistToggle(itemId) {
    const newCheckedItems = { ...this.state.checkedItems };
    newCheckedItems[itemId] = !newCheckedItems[itemId];
    this.setState({ checkedItems: newCheckedItems });
  }

  addCustomChecklistItem() {
    if (this.state.newChecklistItem.trim()) {
      const newItem = {
        id: `custom-${Date.now()}`,
        text: this.state.newChecklistItem.trim(),
        category: 'other',
        priority: 'medium',
        custom: true
      };
      this.checklist = [...this.checklist, newItem];
      this.setState({ 
        newChecklistItem: '',
        checklist: this.checklist
      });
    }
  }

  removeChecklistItem(itemId) {
    this.checklist = this.checklist.filter(item => item.id !== itemId);
    const newCheckedItems = { ...this.state.checkedItems };
    delete newCheckedItems[itemId];
    this.setState({ 
      checklist: this.checklist,
      checkedItems: newCheckedItems
    });
  }

  analyzeTarget() {
    if (!this.state.targetName.trim() || this.state.selectedInterests.length === 0) {
      alert('Please select at least one interest and enter a target name');
      return;
    }

    const checkedCount = Object.values(this.state.checkedItems).filter(Boolean).length;
    const totalItems = this.checklist.length;
    const completionRate = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;

    // Filter checklist items by selected interests
    const relevantItems = this.checklist.filter(item => 
      this.state.selectedInterests.includes(item.category) || item.category === 'other'
    );
    
    const relevantCheckedItems = relevantItems.filter(item => this.state.checkedItems[item.id]);
    const relevantCompletionRate = relevantItems.length > 0 ? 
      (relevantCheckedItems.length / relevantItems.length) * 100 : 0;

    // Calculate priority score
    const highPriorityItems = relevantItems.filter(item => item.priority === 'high');
    const checkedHighPriority = highPriorityItems.filter(item => this.state.checkedItems[item.id]);
    const priorityScore = highPriorityItems.length > 0 ? 
      (checkedHighPriority.length / highPriorityItems.length) * 100 : 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      relevantCompletionRate, 
      priorityScore, 
      relevantCheckedItems, 
      relevantItems
    );

    this.setState({
      analysis: {
        targetName: this.state.targetName,
        targetUrl: this.state.targetUrl,
        totalItems,
        checkedCount,
        completionRate,
        relevantItems,
        relevantCheckedItems,
        relevantCompletionRate,
        priorityScore,
        recommendations,
        selectedInterests: [...this.state.selectedInterests]
      },
      showResults: true
    });
  }

  generateRecommendations(completionRate, priorityScore, checkedItems, allItems) {
    const recommendations = [];
    
    if (completionRate >= 80) {
      recommendations.push({
        type: 'success',
        title: 'Excellent Target Choice!',
        message: 'This target aligns very well with your interests and criteria. High potential for success.'
      });
    } else if (completionRate >= 60) {
      recommendations.push({
        type: 'good',
        title: 'Good Target Choice',
        message: 'This target has good potential. Consider the missing criteria to maximize your chances.'
      });
    } else if (completionRate >= 40) {
      recommendations.push({
        type: 'warning',
        title: 'Moderate Target',
        message: 'This target partially meets your criteria. You might want to look for better alternatives.'
      });
    } else {
      recommendations.push({
        type: 'danger',
        title: 'Poor Target Match',
        message: 'This target doesn\'t align well with your interests. Consider finding a different target.'
      });
    }

    if (priorityScore < 50) {
      recommendations.push({
        type: 'warning',
        title: 'Missing High-Priority Features',
        message: 'This target lacks important high-priority features that are crucial for your success.'
      });
    }

    // Specific recommendations based on checked items
    const hasAuth = checkedItems.some(item => item.id === 'auth-system');
    const hasFileUpload = checkedItems.some(item => item.id === 'file-upload');
    const hasWildcard = checkedItems.some(item => item.id === 'wildcard-domains');

    if (hasAuth && hasFileUpload) {
      recommendations.push({
        type: 'tip',
        title: 'Great Attack Surface',
        message: 'Authentication + File Upload = Excellent opportunities for business logic flaws and upload bypasses.'
      });
    }

    if (hasWildcard) {
      recommendations.push({
        type: 'tip',
        title: 'Subdomain Enumeration',
        message: 'Wildcard scope allows for subdomain enumeration - great for finding forgotten or dev environments.'
      });
    }

    return recommendations;
  }
}
