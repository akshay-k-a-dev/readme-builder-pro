import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, Sparkles, FileText, Code, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectData {
  name: string;
  description: string;
  techStack: string[];
  features: string[];
  installation: string;
  usage: string;
  license: string;
  author: string;
  repository: string;
  liveDemo: string;
  apiKey: string;
}

const ReadmeGenerator = () => {
  const [projectData, setProjectData] = useState<ProjectData>({
    name: "",
    description: "",
    techStack: [],
    features: [],
    installation: "",
    usage: "",
    license: "MIT",
    author: "",
    repository: "",
    liveDemo: "",
    apiKey: localStorage.getItem("groq-api-key") || "",
  });

  const [generatedReadme, setGeneratedReadme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTech, setCurrentTech] = useState("");
  const [currentFeature, setCurrentFeature] = useState("");
  
  const licenses = [
    "MIT",
    "Apache-2.0", 
    "GPL-3.0",
    "BSD-3-Clause",
    "ISC",
    "LGPL-2.1",
    "MPL-2.0",
    "AGPL-3.0",
    "Unlicense",
    "Proprietary"
  ];
  
  const { toast } = useToast();

  const addTechStack = () => {
    if (currentTech.trim() && !projectData.techStack.includes(currentTech.trim())) {
      setProjectData(prev => ({
        ...prev,
        techStack: [...prev.techStack, currentTech.trim()]
      }));
      setCurrentTech("");
    }
  };

  const removeTechStack = (tech: string) => {
    setProjectData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const addFeature = () => {
    if (currentFeature.trim() && !projectData.features.includes(currentFeature.trim())) {
      setProjectData(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }));
      setCurrentFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    setProjectData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const generateReadme = async () => {
    if (!projectData.apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Groq API key to generate README",
        variant: "destructive",
      });
      return;
    }

    if (!projectData.name || !projectData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least project name and description",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    localStorage.setItem("groq-api-key", projectData.apiKey);

    const prompt = `Create a comprehensive, professional README.md file for a project with the following details:

Project Name: ${projectData.name}
Description: ${projectData.description}
Tech Stack: ${projectData.techStack.join(", ")}
Features: ${projectData.features.join(", ")}
Installation Instructions: ${projectData.installation}
Usage Instructions: ${projectData.usage}
License: ${projectData.license}
Author: ${projectData.author}
Repository: ${projectData.repository}
Live Demo: ${projectData.liveDemo}

Please create a modern, well-structured README.md with:
- Attractive header with project title and description
- Badges for tech stack and license
- Table of contents
- Features section with emojis
- Installation and usage instructions
- Contributing guidelines
- License information
- Contact information

Make it visually appealing with proper markdown formatting, emojis, and clear sections. Include placeholder images where appropriate.`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${projectData.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            {
              role: 'system',
              content: 'You are a professional technical writer specializing in creating comprehensive README.md files for GitHub repositories. Create detailed, well-formatted README files with proper markdown syntax.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const readme = data.choices[0]?.message?.content || 'Failed to generate README';
      
      setGeneratedReadme(readme);
      toast({
        title: "README Generated!",
        description: "Your professional README.md has been created successfully",
      });
    } catch (error) {
      console.error('Error generating README:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate README. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReadme);
    toast({
      title: "Copied!",
      description: "README content copied to clipboard",
    });
  };

  const downloadReadme = () => {
    const blob = new Blob([generatedReadme], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "README.md file has been downloaded",
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              README Generator
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create professional README.md files for your GitHub repositories using AI. 
            Just fill in your project details and let AI do the rest.
          </p>
        </div>

        <Tabs defaultValue="form" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Project Details
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Generated README
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Essential details about your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <div className="h-4 w-4 bg-warning rounded-full mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-warning-foreground mb-1">🔒 API Key Security Notice</p>
                        <p className="text-muted-foreground">
                          For secure API key storage, consider connecting to Supabase. 
                          Current method stores the key in browser localStorage.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Groq API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="gsk_..."
                      value={projectData.apiKey}
                      onChange={(e) => setProjectData(prev => ({ ...prev, apiKey: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="My Awesome Project"
                      value={projectData.name}
                      onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="A brief description of what your project does..."
                      value={projectData.description}
                      onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      placeholder="Your Name"
                      value={projectData.author}
                      onChange={(e) => setProjectData(prev => ({ ...prev, author: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license">License</Label>
                    <Select value={projectData.license} onValueChange={(value) => setProjectData(prev => ({ ...prev, license: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a license" />
                      </SelectTrigger>
                      <SelectContent>
                        {licenses.map((license) => (
                          <SelectItem key={license} value={license}>
                            {license}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Tech Stack and Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Tech Stack & Features
                  </CardTitle>
                  <CardDescription>
                    Technologies used and key features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tech Stack</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="React, Node.js, etc."
                        value={currentTech}
                        onChange={(e) => setCurrentTech(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTechStack()}
                      />
                      <Button onClick={addTechStack} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {projectData.techStack.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTechStack(tech)}
                        >
                          {tech} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Features</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="User authentication, API integration, etc."
                        value={currentFeature}
                        onChange={(e) => setCurrentFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                      />
                      <Button onClick={addFeature} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {projectData.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => removeFeature(feature)}
                        >
                          {feature} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repository">Repository URL</Label>
                    <Input
                      id="repository"
                      placeholder="https://github.com/username/repo"
                      value={projectData.repository}
                      onChange={(e) => setProjectData(prev => ({ ...prev, repository: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="liveDemo">Live Demo URL</Label>
                    <Input
                      id="liveDemo"
                      placeholder="https://myproject.com"
                      value={projectData.liveDemo}
                      onChange={(e) => setProjectData(prev => ({ ...prev, liveDemo: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Installation & Usage</CardTitle>
                <CardDescription>
                  How to install and use your project
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installation">Installation Instructions</Label>
                  <Textarea
                    id="installation"
                    placeholder="npm install&#10;npm start"
                    value={projectData.installation}
                    onChange={(e) => setProjectData(prev => ({ ...prev, installation: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usage">Usage Instructions</Label>
                  <Textarea
                    id="usage"
                    placeholder="How to use your project..."
                    value={projectData.usage}
                    onChange={(e) => setProjectData(prev => ({ ...prev, usage: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button
                onClick={generateReadme}
                disabled={isGenerating}
                className="hero"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate README with AI
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {generatedReadme ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Generated README.md</CardTitle>
                      <CardDescription>
                        Your professional README is ready!
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={copyToClipboard} variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button onClick={downloadReadme} variant="success" size="sm">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono overflow-auto max-h-96">
                      {generatedReadme}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No README Generated Yet</h3>
                  <p className="text-muted-foreground text-center">
                    Fill in your project details and click "Generate README with AI" to create your professional README.md file.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReadmeGenerator;