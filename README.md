<p align="center">
  <a href="https://fingerprint.com">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://fingerprintjs.github.io/home/resources/logo_light.svg" />
        <source media="(prefers-color-scheme: light)" srcset="https://fingerprintjs.github.io/home/resources/logo_dark.svg" />
        <img src="https://fingerprintjs.github.io/home/resources/logo_dark.svg" alt="Fingerprint logo" width="312px" />
   </picture>
  </a>
</p>
<p align="center">
<a href="https://github.com/fingerprintjs/fingerprint-pro-akamai-proxy-integration"><img src="https://img.shields.io/github/v/release/fingerprintjs/fingerprint-pro-akamai-proxy-integration" alt="Current version"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/:license-mit-blue.svg" alt="MIT license"></a>
<a href="https://discord.gg/39EpE2neBg"><img src="https://img.shields.io/discord/852099967190433792?style=logo&label=Discord&logo=Discord&logoColor=white" alt="Discord server"></a>
</p>

> [!WARNING]
> This integration is in Beta

# Fingerprint Pro Akamai Proxy Integration

[Fingerprint](https://fingerprint.com) is a device intelligence platform offering 99.5% accurate visitor identification.

Fingerprint Akamai Proxy Integration is responsible for proxying identification and agent-download requests between your website and Fingerprint through your Akamai infrastructure. The integration consists of a set of property rules you need to add to your Akamai property configuration. The property rules template is available in this repository.

## 🚧 Requirements and expectations

* **Integration in Beta**: Please report any issues to our support team.

* **Limited to Enterprise plan**:   The Akamai Proxy Integration is accessible and exclusively supported for customers on the **Enterprise** Plan. Other customers are encouraged to use [Custom subdomain setup](https://dev.fingerprint.com/docs/custom-subdomain-setup) or [Cloudflare Proxy Integration](https://dev.fingerprint.com/docs/cloudflare-integration).

* **Manual updates occasionally required**: The underlying data contract in the identification logic can change to keep up with browser updates. Using the Akamai Proxy Integration might require occasional manual updates on your side. Ignoring these updates will lead to lower accuracy or service disruption.

## How to install with Terraform

> [!NOTE]
> This section assumes you use Terraform to manage your site infrastructure on Akamai and that your site uses the `latest` Akamai rule format.
> * If you do not use Terraform, see  [How to install without Terraform](#how-to-install-using-akamai-property-manager-api-without-terraform).
> * If your Akamai property uses a different rule format, please contact our [support team](https://fingerprint.com/support/).


This is a quick overview of the installation setup. For detailed step-by-step instructions, see the [Akamai proxy integration guide in our documentation](https://dev.fingerprint.com/docs/akamai-proxy-integration).

1. Go to Fingerprint **Dashboard** > [**API Keys**](https://dashboard.fingerprint.com/api-keys) and click **Create Proxy Key** to create a proxy secret. You will use it later to authenticate your requests to Fingerprint APIs. 
2. Add the following variable blocks to the Akamai property [Rules template](https://techdocs.akamai.com/terraform/docs/pm-ds-rules-template) in your Terraform configuration file. If you are using a plain JSON file instead of a rules template, reach out to our [support team](https://fingerprint.com/support/).

    ```tf
    # main.tf
    data "akamai_property_rules_template" "rules" {
          # Assuming this is property's rules file
          template_file = "/rules/main.json" 
          variables {
            name  = "fpjs_integration_path"
            value = "YOUR_INTEGRATION_PATH_HERE" # any random string that's a valid URL
            type = "string"
          }
          variables {
            name  = "fpjs_agent_path"
            value = "YOUR_AGENT_PATH_HERE" # any random string that's a valid URL
            type = "string"
          }
          variables {
            name  = "fpjs_result_path"
            value = "YOUR_RESULT_PATH_HERE" # any random string that's a valid URL
            type = "string"
          }
          variables {
            name  = "fpjs_proxy_secret"
            value = "YOUR_PROXY_SECRET_HERE" # Use the proxy secret from the previous step
            type = "string"
          }
    }
    ```

3. Go to this repository [latest releases](https://github.com/fingerprintjs/fingerprint-pro-akamai-integration-property-rules/releases/latest) and download these two JSON files:
   * `terraform/fingerprint-property-rules.json`
   * `terraform/fingerprint-property-variables.json`
4. Add the files to the `rules` directory of your Terraform project.
5. Reference the files inside your `rules/main.json` file:

    ```json5
    // rules/main.json
    {
      "rules": {
        "name": "default",
        "behaviors": [
          // ...
        ],
        "children": [
          //...
          // Add the downloaded rules file as a child
          "#include:fingerprint-property-rules.json" 
        ],
        // Add the downloaded variables file (or merge it with existing variables file)
        "variables": "#include:fingerprint-property-variables.json"
        // ...
      }
    }
    ```

6. Run `terraform plan` to review your changes and `terraform apply` to deploy them.
7. Configure the Fingerprint [JS Agent](https://dev.fingerprint.com/docs/js-agent) on your website using the paths defined in Step 2.

    ```javascript
    import * as FingerprintJS from '@fingerprintjs/fingerprintjs-pro'
    
    const fpPromise = FingerprintJS.load({
      apiKey: 'PUBLIC_API_KEY',
      scriptUrlPattern: [
        'https://yourwebsite.com/YOUR_INTEGRATION_PATH_HERE/YOUR_AGENT_PATH_HERE?apiKey=<apiKey>&version=<version>&loaderVersion=<loaderVersion>',
        FingerprintJS.defaultScriptUrlPattern, // Fallback to default CDN in case of error
      ],
      endpoint: 
        'https://yourwebsite.com/YOUR_INTEGRATION_PATH_HERE/YOUR_RESULT_PATH_HERE?region=us',
        FingerprintJS.defaultEndpoint // Fallback to default endpoint in case of error
      ],
    });
    ```

See the [Akamai proxy integration guide](https://dev.fingerprint.com/docs/deploy-akamai-proxy-integration-via-terraform#step-3-add-variable-blocks-to-your-rules-template) in our documentation for more details. 

### Building property rules for Terraform locally

If you prefer, you can clone this repository and build the property rules and variables locally.

1. Run `pnpm install`.
2. Run `pnpm build --type terraform`. It will generate the following files you can use in your Terraform configuration as described above.

  - `dist/terraform/json/fingerprint.json`
  - `dist/terraform/json/variables.json`
  - `dist/terraform/example.tf`

The JSON files are equivalent to the JSON files available in the [latest releases](https://github.com/fingerprintjs/fingerprint-pro-akamai-integration-property-rules/releases/latest).

## How to install using Akamai Property Manager API (without Terraform)

You can clone this repository and build the property rules locally into a single `body.json` file. You can then apply them as a patch update to your property configuration using Akamai [Property Manager API](https://techdocs.akamai.com/property-mgr/reference/api). This allows you to install the integration in an automated way even if you do not use Terraform.


1. Run `pnpm install`.
2. Run `pnpm build --type patchBody --integration-path YOUR_INTEGRATION_PATH_HERE --agent-path YOUR_AGENT_PATH_HERE --result-path YOUR_RESULT_PATH_HERE --proxy-secret YOUR_PROXY_SECRET_HERE`.
   * Use the same values you would use in [Step 2](#how-to-install-with-terraform) if you were installing with Terraform.
   * The command generates a `dist/patch-body/body.json` file. This file includes all rules and property variables necessary for the integration.
3. Use the [Patch a property's rule tree](https://techdocs.akamai.com/property-mgr/reference/patch-property-version-rules) endpoint of the Akamai Property Manager API to apply the generated JSON to your Akamai property.
  
If you have any questions, reach out to our [support team](https://fingerprint.com/support). 

## License

This project is licensed under the MIT license. See the [LICENSE](https://github.com/fingerprintjs/fingerprint-pro-akamai-integration-property-rules/blob/main/LICENSE) file for more info.
