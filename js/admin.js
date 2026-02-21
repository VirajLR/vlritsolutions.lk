const STORAGE_KEY = 'vlr_site_data';
const SESSION_KEY = 'vlr_admin_session';
const DEFAULT_URL = 'data/site.json';
const API_SETTINGS_KEY = 'vlr_api_settings';
const DEFAULT_API_URL = 'http://localhost:5205/api/site';

const loginScreen = document.querySelector('#login-screen');
const loginForm = document.querySelector('#login-form');
const loginError = document.querySelector('#login-error');
const dashboard = document.querySelector('#admin-dashboard');
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');
const toast = document.querySelector('#admin-toast');

const previewBtn = document.querySelector('#preview-btn');
const saveBtn = document.querySelector('#save-btn');
const exportBtn = document.querySelector('#export-btn');
const importBtn = document.querySelector('#import-btn');
const importFile = document.querySelector('#import-file');
const resetBtn = document.querySelector('#reset-btn');

const getApiSettings = () => {
  try {
    const stored = localStorage.getItem(API_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    return {};
  }
};

let siteData = null;
let apiSettings = getApiSettings();

const showToast = (message) => {
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
};

const setActiveTab = (tabId) => {
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabId);
  });
  panels.forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === tabId);
  });
};

const loadDefaultData = async () => {
  const response = await fetch(DEFAULT_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load default data');
  }
  return response.json();
};

const fetchApiData = async () => {
  const apiUrl = apiSettings.apiUrl || DEFAULT_API_URL;
  if (!apiUrl) {
    throw new Error('API URL not set');
  }
  const response = await fetch(apiUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('API request failed');
  }
  return response.json();
};

const postApiData = async (data) => {
  const apiUrl = apiSettings.apiUrl || DEFAULT_API_URL;
  if (!apiUrl || !apiSettings.apiKey) {
    throw new Error('API settings missing');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiSettings.apiKey
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('API save failed');
  }

  return true;
};

const getLocalData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
};

const saveLocalData = () => {
  if (!siteData) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(siteData));
};

const saveApiSettings = () => {
  localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(apiSettings));
  showToast('API settings saved.');
};

const normalizeData = (data) => {
  const normalized = data || {};
  normalized.brand = normalized.brand || { name: 'VLR IT Solutions', tagline: '' };
  normalized.contact = normalized.contact || { phone: '', email: '', address: '' };
  normalized.social = normalized.social || { facebook: '', instagram: '', whatsapp: '', x: '' };
  normalized.hero = normalized.hero || {
    title: '',
    subtitle: '',
    ctaPrimary: '',
    ctaSecondary: '',
    heroImage: ''
  };
  normalized.services = normalized.services || [];
  normalized.solutions = normalized.solutions || [];
  normalized.projects = normalized.projects || [];
  normalized.about = normalized.about || { text: '', stats: [] };
  normalized.about.stats = normalized.about.stats || [];
  normalized.testimonials = normalized.testimonials || [];
  normalized.footer = normalized.footer || { copyrightText: '' };
  return normalized;
};

const createField = (labelText, input) => {
  const label = document.createElement('label');
  label.className = 'field';
  const span = document.createElement('span');
  span.textContent = labelText;
  label.appendChild(span);
  label.appendChild(input);
  return label;
};

const createInput = ({ value, type = 'text', placeholder = '', onChange }) => {
  const input = document.createElement('input');
  input.type = type;
  input.value = value ?? '';
  input.placeholder = placeholder;
  input.addEventListener('input', () => onChange(input.value));
  return input;
};

const createTextarea = ({ value, placeholder = '', onChange }) => {
  const textarea = document.createElement('textarea');
  textarea.value = value ?? '';
  textarea.placeholder = placeholder;
  textarea.addEventListener('input', () => onChange(textarea.value));
  return textarea;
};

const createActionButtons = ({ index, items, onMove, onRemove }) => {
  const actions = document.createElement('div');
  actions.className = 'repeater-actions';
  const upBtn = document.createElement('button');
  upBtn.type = 'button';
  upBtn.className = 'btn ghost';
  upBtn.textContent = 'Up';
  upBtn.disabled = index === 0;
  upBtn.addEventListener('click', () => onMove(index, index - 1));

  const downBtn = document.createElement('button');
  downBtn.type = 'button';
  downBtn.className = 'btn ghost';
  downBtn.textContent = 'Down';
  downBtn.disabled = index === items.length - 1;
  downBtn.addEventListener('click', () => onMove(index, index + 1));

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn ghost';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => onRemove(index));

  actions.append(upBtn, downBtn, removeBtn);
  return actions;
};

const moveItem = (arr, from, to) => {
  if (to < 0 || to >= arr.length) {
    return;
  }
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
};

const renderContactPanel = () => {
  const panel = document.querySelector('[data-panel="contact"]');
  panel.innerHTML = '';

  const brandSection = document.createElement('div');
  brandSection.className = 'panel-section';
  brandSection.innerHTML = '<h3>Brand</h3><p>Update the brand name and tagline.</p>';

  brandSection.appendChild(
    createField(
      'Brand Name',
      createInput({
        value: siteData.brand?.name,
        placeholder: 'VLR IT Solutions',
        onChange: (val) => {
          siteData.brand.name = val;
        }
      })
    )
  );

  brandSection.appendChild(
    createField(
      'Tagline',
      createInput({
        value: siteData.brand?.tagline,
        placeholder: 'Premium IT solutions for Sri Lankan businesses',
        onChange: (val) => {
          siteData.brand.tagline = val;
        }
      })
    )
  );

  const section = document.createElement('div');
  section.className = 'panel-section';
  section.innerHTML = '<h3>Contact Details</h3><p>Update phone, email, address, and social links.</p>';

  section.appendChild(
    createField(
      'Phone',
      createInput({
        value: siteData.contact?.phone,
        placeholder: '0770 232 612',
        onChange: (val) => {
          siteData.contact.phone = val;
        }
      })
    )
  );

  section.appendChild(
    createField(
      'Email',
      createInput({
        value: siteData.contact?.email,
        placeholder: 'info@company.com',
        onChange: (val) => {
          siteData.contact.email = val;
        }
      })
    )
  );

  section.appendChild(
    createField(
      'Address',
      createTextarea({
        value: siteData.contact?.address,
        placeholder: 'Address',
        onChange: (val) => {
          siteData.contact.address = val;
        }
      })
    )
  );

  const socialSection = document.createElement('div');
  socialSection.className = 'panel-section';
  socialSection.innerHTML = '<h3>Social Links</h3><p>Leave empty to show a disabled icon.</p>';

  ['facebook', 'instagram', 'whatsapp', 'x'].forEach((key) => {
    socialSection.appendChild(
      createField(
        key.toUpperCase(),
        createInput({
          value: siteData.social?.[key],
          placeholder: 'https://',
          onChange: (val) => {
            siteData.social[key] = val;
          }
        })
      )
    );
  });

  const apiSection = document.createElement('div');
  apiSection.className = 'panel-section';
  apiSection.innerHTML = '<h3>API Settings</h3><p>Used to sync with the site API (stored locally).</p>';

  apiSection.appendChild(
    createField(
      'API URL',
      createInput({
        value: apiSettings.apiUrl || DEFAULT_API_URL,
        placeholder: DEFAULT_API_URL,
        onChange: (val) => {
          apiSettings.apiUrl = val;
        }
      })
    )
  );

  apiSection.appendChild(
    createField(
      'API Key',
      createInput({
        type: 'password',
        value: apiSettings.apiKey || '',
        placeholder: 'vlr-dev-key-2026',
        onChange: (val) => {
          apiSettings.apiKey = val;
        }
      })
    )
  );

  const saveApiBtn = document.createElement('button');
  saveApiBtn.type = 'button';
  saveApiBtn.className = 'btn ghost';
  saveApiBtn.textContent = 'Save API Settings';
  saveApiBtn.addEventListener('click', saveApiSettings);

  apiSection.appendChild(saveApiBtn);

  const footerSection = document.createElement('div');
  footerSection.className = 'panel-section';
  footerSection.innerHTML = '<h3>Footer</h3><p>Update copyright text.</p>';
  footerSection.appendChild(
    createField(
      'Copyright',
      createInput({
        value: siteData.footer?.copyrightText,
        onChange: (val) => {
          siteData.footer.copyrightText = val;
        }
      })
    )
  );

  panel.append(brandSection, section, socialSection, apiSection, footerSection);
};

const renderHeroPanel = () => {
  const panel = document.querySelector('[data-panel="hero"]');
  panel.innerHTML = '';
  const section = document.createElement('div');
  section.className = 'panel-section';
  section.innerHTML = '<h3>Hero Settings</h3><p>Update headline and CTA text.</p>';

  section.appendChild(
    createField(
      'Hero Title',
      createTextarea({
        value: siteData.hero?.title,
        onChange: (val) => {
          siteData.hero.title = val;
        }
      })
    )
  );

  section.appendChild(
    createField(
      'Hero Subtitle',
      createInput({
        value: siteData.hero?.subtitle,
        onChange: (val) => {
          siteData.hero.subtitle = val;
        }
      })
    )
  );

  section.appendChild(
    createField(
      'Primary CTA',
      createInput({
        value: siteData.hero?.ctaPrimary,
        onChange: (val) => {
          siteData.hero.ctaPrimary = val;
        }
      })
    )
  );

  section.appendChild(
    createField(
      'Secondary CTA',
      createInput({
        value: siteData.hero?.ctaSecondary,
        onChange: (val) => {
          siteData.hero.ctaSecondary = val;
        }
      })
    )
  );

  section.appendChild(
    createField(
      'Hero Image Path',
      createInput({
        value: siteData.hero?.heroImage,
        onChange: (val) => {
          siteData.hero.heroImage = val;
        }
      })
    )
  );

  panel.append(section);
};

const renderServicesPanel = () => {
  const panel = document.querySelector('[data-panel="services"]');
  panel.innerHTML = '';

  const section = document.createElement('div');
  section.className = 'panel-section';
  section.innerHTML = '<h3>Services</h3><p>Add, edit, remove, or reorder services.</p>';

  const list = document.createElement('div');
  list.className = 'repeater';

  siteData.services.forEach((service, index) => {
    const item = document.createElement('div');
    item.className = 'repeater-item';
    item.appendChild(
      createField(
        'Title',
        createInput({
          value: service.title,
          onChange: (val) => {
            service.title = val;
          }
        })
      )
    );
    item.appendChild(
      createField(
        'Description',
        createTextarea({
          value: service.description,
          onChange: (val) => {
            service.description = val;
          }
        })
      )
    );
    item.appendChild(
      createActionButtons({
        index,
        items: siteData.services,
        onMove: (from, to) => {
          moveItem(siteData.services, from, to);
          renderServicesPanel();
        },
        onRemove: (idx) => {
          siteData.services.splice(idx, 1);
          renderServicesPanel();
        }
      })
    );
    list.appendChild(item);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn ghost';
  addBtn.textContent = 'Add Service';
  addBtn.addEventListener('click', () => {
    siteData.services.push({ title: 'New Service', description: '' });
    renderServicesPanel();
  });

  section.append(list, addBtn);
  panel.append(section);
};

const renderSolutionsPanel = () => {
  const panel = document.querySelector('[data-panel="solutions"]');
  panel.innerHTML = '';

  const section = document.createElement('div');
  section.className = 'panel-section';
  section.innerHTML = '<h3>Solutions</h3><p>Manage solution blocks and bullet points.</p>';

  const list = document.createElement('div');
  list.className = 'repeater';

  siteData.solutions.forEach((solution, index) => {
    const item = document.createElement('div');
    item.className = 'repeater-item';

    item.appendChild(
      createField(
        'Title',
        createInput({
          value: solution.title,
          onChange: (val) => {
            solution.title = val;
          }
        })
      )
    );

    const bulletsWrapper = document.createElement('div');
    bulletsWrapper.className = 'repeater';
    solution.bullets.forEach((bullet, bulletIndex) => {
      const bulletRow = document.createElement('div');
      bulletRow.className = 'repeater-item';
      bulletRow.appendChild(
        createField(
          `Bullet ${bulletIndex + 1}`,
          createInput({
            value: bullet,
            onChange: (val) => {
              solution.bullets[bulletIndex] = val;
            }
          })
        )
      );
      const removeBullet = document.createElement('button');
      removeBullet.type = 'button';
      removeBullet.className = 'btn ghost';
      removeBullet.textContent = 'Remove Bullet';
      removeBullet.addEventListener('click', () => {
        solution.bullets.splice(bulletIndex, 1);
        renderSolutionsPanel();
      });
      bulletRow.appendChild(removeBullet);
      bulletsWrapper.appendChild(bulletRow);
    });

    const addBullet = document.createElement('button');
    addBullet.type = 'button';
    addBullet.className = 'btn ghost';
    addBullet.textContent = 'Add Bullet';
    addBullet.addEventListener('click', () => {
      solution.bullets.push('New bullet');
      renderSolutionsPanel();
    });

    item.append(bulletsWrapper, addBullet);
    item.appendChild(
      createActionButtons({
        index,
        items: siteData.solutions,
        onMove: (from, to) => {
          moveItem(siteData.solutions, from, to);
          renderSolutionsPanel();
        },
        onRemove: (idx) => {
          siteData.solutions.splice(idx, 1);
          renderSolutionsPanel();
        }
      })
    );
    list.appendChild(item);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn ghost';
  addBtn.textContent = 'Add Solution';
  addBtn.addEventListener('click', () => {
    siteData.solutions.push({ title: 'New Solution', bullets: ['Bullet 1'] });
    renderSolutionsPanel();
  });

  section.append(list, addBtn);
  panel.append(section);
};

const renderProjectsPanel = () => {
  const panel = document.querySelector('[data-panel="projects"]');
  panel.innerHTML = '';

  const section = document.createElement('div');
  section.className = 'panel-section';
  section.innerHTML = '<h3>Projects</h3><p>Update case studies, outcomes, and tech stacks.</p>';

  const list = document.createElement('div');
  list.className = 'repeater';

  siteData.projects.forEach((project, index) => {
    const item = document.createElement('div');
    item.className = 'repeater-item';

    item.appendChild(
      createField(
        'Title',
        createInput({
          value: project.title,
          onChange: (val) => {
            project.title = val;
          }
        })
      )
    );
    item.appendChild(
      createField(
        'Outcome',
        createInput({
          value: project.outcome,
          onChange: (val) => {
            project.outcome = val;
          }
        })
      )
    );
    item.appendChild(
      createField(
        'Image Path',
        createInput({
          value: project.image,
          onChange: (val) => {
            project.image = val;
          }
        })
      )
    );

    const stackSection = document.createElement('div');
    stackSection.className = 'repeater';
    project.stack.forEach((stackItem, stackIndex) => {
      const stackRow = document.createElement('div');
      stackRow.className = 'repeater-item';
      stackRow.appendChild(
        createField(
          `Stack ${stackIndex + 1}`,
          createInput({
            value: stackItem,
            onChange: (val) => {
              project.stack[stackIndex] = val;
            }
          })
        )
      );
      const removeStack = document.createElement('button');
      removeStack.type = 'button';
      removeStack.className = 'btn ghost';
      removeStack.textContent = 'Remove Stack';
      removeStack.addEventListener('click', () => {
        project.stack.splice(stackIndex, 1);
        renderProjectsPanel();
      });
      stackRow.appendChild(removeStack);
      stackSection.appendChild(stackRow);
    });

    const addStack = document.createElement('button');
    addStack.type = 'button';
    addStack.className = 'btn ghost';
    addStack.textContent = 'Add Stack Tag';
    addStack.addEventListener('click', () => {
      project.stack.push('New Tag');
      renderProjectsPanel();
    });

    item.append(stackSection, addStack);
    item.appendChild(
      createActionButtons({
        index,
        items: siteData.projects,
        onMove: (from, to) => {
          moveItem(siteData.projects, from, to);
          renderProjectsPanel();
        },
        onRemove: (idx) => {
          siteData.projects.splice(idx, 1);
          renderProjectsPanel();
        }
      })
    );

    list.appendChild(item);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn ghost';
  addBtn.textContent = 'Add Project';
  addBtn.addEventListener('click', () => {
    siteData.projects.push({ title: 'New Project', outcome: '', stack: ['Tag'], image: '' });
    renderProjectsPanel();
  });

  section.append(list, addBtn);
  panel.append(section);
};

const renderAboutPanel = () => {
  const panel = document.querySelector('[data-panel="about"]');
  panel.innerHTML = '';
  const section = document.createElement('div');
  section.className = 'panel-section';
  section.innerHTML = '<h3>About</h3><p>Update about text and stats.</p>';

  section.appendChild(
    createField(
      'About Text',
      createTextarea({
        value: siteData.about?.text,
        onChange: (val) => {
          siteData.about.text = val;
        }
      })
    )
  );

  const statsList = document.createElement('div');
  statsList.className = 'repeater';
  siteData.about.stats.forEach((stat, index) => {
    const item = document.createElement('div');
    item.className = 'repeater-item';
    item.appendChild(
      createField(
        'Label',
        createInput({
          value: stat.label,
          onChange: (val) => {
            stat.label = val;
          }
        })
      )
    );
    item.appendChild(
      createField(
        'Value',
        createInput({
          value: stat.value,
          onChange: (val) => {
            stat.value = val;
          }
        })
      )
    );
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn ghost';
    removeBtn.textContent = 'Remove Stat';
    removeBtn.addEventListener('click', () => {
      siteData.about.stats.splice(index, 1);
      renderAboutPanel();
    });
    item.appendChild(removeBtn);
    statsList.appendChild(item);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn ghost';
  addBtn.textContent = 'Add Stat';
  addBtn.addEventListener('click', () => {
    siteData.about.stats.push({ label: 'New Stat', value: '0' });
    renderAboutPanel();
  });

  section.append(statsList, addBtn);
  panel.append(section);
};

const renderTestimonialsPanel = () => {
  const panel = document.querySelector('[data-panel="testimonials"]');
  panel.innerHTML = '';

  const section = document.createElement('div');
  section.className = 'panel-section';
  section.innerHTML = '<h3>Testimonials</h3><p>Add or update client feedback.</p>';

  const list = document.createElement('div');
  list.className = 'repeater';

  siteData.testimonials.forEach((testimonial, index) => {
    const item = document.createElement('div');
    item.className = 'repeater-item';
    item.appendChild(
      createField(
        'Name',
        createInput({
          value: testimonial.name,
          onChange: (val) => {
            testimonial.name = val;
          }
        })
      )
    );
    item.appendChild(
      createField(
        'Role',
        createInput({
          value: testimonial.role,
          onChange: (val) => {
            testimonial.role = val;
          }
        })
      )
    );
    item.appendChild(
      createField(
        'Message',
        createTextarea({
          value: testimonial.message,
          onChange: (val) => {
            testimonial.message = val;
          }
        })
      )
    );
    item.appendChild(
      createActionButtons({
        index,
        items: siteData.testimonials,
        onMove: (from, to) => {
          moveItem(siteData.testimonials, from, to);
          renderTestimonialsPanel();
        },
        onRemove: (idx) => {
          siteData.testimonials.splice(idx, 1);
          renderTestimonialsPanel();
        }
      })
    );
    list.appendChild(item);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn ghost';
  addBtn.textContent = 'Add Testimonial';
  addBtn.addEventListener('click', () => {
    siteData.testimonials.push({ name: 'New Client', role: 'Role', message: '' });
    renderTestimonialsPanel();
  });

  section.append(list, addBtn);
  panel.append(section);
};

const renderImagesPanel = () => {
  const panel = document.querySelector('[data-panel="images"]');
  panel.innerHTML = '';

  const section = document.createElement('div');
  section.className = 'panel-section';
  section.innerHTML = '<h3>Images</h3><p>Update hero and project image paths.</p>';

  section.appendChild(
    createField(
      'Hero Image',
      createInput({
        value: siteData.hero?.heroImage,
        onChange: (val) => {
          siteData.hero.heroImage = val;
        }
      })
    )
  );

  siteData.projects.forEach((project, index) => {
    section.appendChild(
      createField(
        `Project ${index + 1} Image`,
        createInput({
          value: project.image,
          onChange: (val) => {
            project.image = val;
          }
        })
      )
    );
  });

  panel.append(section);
};

const renderAllPanels = () => {
  renderContactPanel();
  renderHeroPanel();
  renderServicesPanel();
  renderSolutionsPanel();
  renderProjectsPanel();
  renderAboutPanel();
  renderTestimonialsPanel();
  renderImagesPanel();
};

const handleExport = () => {
  const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vlr-site-data.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const handleImport = async (file) => {
  if (!file) {
    return;
  }
  const text = await file.text();
  try {
    const json = JSON.parse(text);
    siteData = normalizeData(json);
    renderAllPanels();
    saveLocalData();
    showToast('JSON imported successfully.');
  } catch (error) {
    showToast('Invalid JSON file.');
  }
};

const handleReset = async () => {
  localStorage.removeItem(STORAGE_KEY);
  siteData = normalizeData(await loadDefaultData());
  renderAllPanels();
  showToast('Reset to default data.');
};

const handleSave = async () => {
  if (!siteData.contact?.phone || !siteData.contact?.email || !siteData.contact?.address || !siteData.brand?.name) {
    showToast('Brand name, phone, email, and address are required.');
    return;
  }

  let apiMessage = '';
  try {
    await postApiData(siteData);
    apiMessage = 'Saved to API and local cache.';
  } catch (error) {
    apiMessage = apiSettings.apiKey ? 'Saved locally. API not reachable.' : 'Saved locally. API key missing.';
  }

  saveLocalData();
  showToast(apiMessage);
};

const initTabs = () => {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setActiveTab(tab.dataset.tab);
    });
  });
};

const initActions = () => {
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      window.open('index.html', '_blank');
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', handleSave);
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', handleExport);
  }

  if (importBtn) {
    importBtn.addEventListener('click', () => importFile.click());
  }

  if (importFile) {
    importFile.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      handleImport(file);
      importFile.value = '';
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', handleReset);
  }
};

const showDashboard = () => {
  loginScreen.hidden = true;
  dashboard.hidden = false;
};

const initLogin = (onSuccess) => {
  if (sessionStorage.getItem(SESSION_KEY) === 'true') {
    showDashboard();
    onSuccess();
    return;
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const username = formData.get('username');
    const password = formData.get('password');

    if (username === 'admin' && password === 'vlr@1234') {
      sessionStorage.setItem(SESSION_KEY, 'true');
      loginError.textContent = '';
      showDashboard();
      onSuccess();
      return;
    }

    loginError.textContent = 'Invalid credentials. Please try again.';
  });
};

const init = async () => {
  const initializeDashboard = async () => {
    const localData = getLocalData();
    if (localData) {
      siteData = normalizeData(localData);
    } else {
      try {
        siteData = normalizeData(await fetchApiData());
      } catch (error) {
        siteData = normalizeData(await loadDefaultData());
      }
    }

    renderAllPanels();
    initTabs();
    initActions();
  };

  initLogin(initializeDashboard);
};

init();
