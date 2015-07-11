from __future__ import division
import copy
import json



# CONSTANTS
ITERATIONS = 10
L = 0.8



# FUNCTIONS
### Utilities ###
# Reads in a basic graph from a file.
def readGraph():
	senders = {}
	recipients = {}
	
	with open("blogs.txt", "r") as input:
		for line in input:
			tokens = line.split("\t")
			sender = tokens[0].strip()
			recipient = tokens[1].strip()
			
			# Ignores links to itself
			if sender == recipient:
				continue
					
			# Adds sender and recipient to the graph
			if sender not in senders:
				senders[sender] = set()
					
			if recipient not in senders:
				senders[recipient] = set()
			
			if sender not in recipients:
				recipients[sender] = set()
			
			if recipient not in recipients:
				recipients[recipient] = set()
			
			senders[sender].add(recipient)
			recipients[recipient].add(sender)
	
	return senders, recipients


# Collects the data necessary for the graph, saves to JSON.
def saveAsJSON(senders, PR):
	nodes = []
	links = []
	
	bloggers = senders.keys()
	for source, sender in enumerate(bloggers):
		nodes.append({
			"name": sender,
			"importance": PR[sender]
		})
		
		for recipient in senders[sender]:
			links.append({
				"source": source,
				"target": bloggers.index(recipient)})
	
	with open("blogs.json", "w") as output:
		json.dump({"nodes": nodes, "links": links}, output)
	
	
# Normalises a dictionary of scores using a provided normaliser.
def normalize(scores, norm):
	for node, score in scores.iteritems():
		scores[node] = score / norm


### HITS ###
# Initialises HITS values.
def setupHITS(senderGraph):
	initScore = 1.0 / pow(len(senderGraph), 0.5)
	
	hubs = {}
	authorities = {}

	for sender, recipients in senderGraph.iteritems():
		hubs[sender] = initScore
		authorities[sender] = initScore

	return hubs, authorities


# Iteratively computes hub and authority scores.
def computeHITS(senderGraph, recipientGraph):
	# Sets up data structures for HITS analysis
	hubs, authorities = setupHITS(senderGraph)

	for i in range(ITERATIONS):
		norm = 0
		
		# Computes hub scores
		for sender, recipients in senderGraph.iteritems():
			hubs[sender] = 0
			
			for recipient in recipients:
				hubs[sender] += authorities[recipient]
	
			norm += pow(hubs[sender], 2)
		
		# Normalizes hub scores
		norm = pow(norm, 0.5)
		normalize(hubs, norm)

		# Computes authority scores
		norm = 0
		
		for recipient, senders in recipientGraph.iteritems():
			authorities[recipient] = 0
			
			for sender in senders:
				authorities[recipient] += hubs[sender]
		
			norm += pow(authorities[recipient], 2)

		# Normalizes authority scores
		norm = pow(norm, 0.5)
		normalize(authorities, norm)

	return hubs, authorities


### PageRank ###
# Initialises PageRank values, creates a set of sinks.
def setupPR(senderGraph):
	initPR = 1.0 / len(senderGraph)
	
	currentPR = {}
	sinks = set()
	
	for sender, recipients in senderGraph.iteritems():
		currentPR[sender] = initPR
		
		if len(recipients) == 0:
			sinks.add(sender)

	return currentPR, sinks


# Iteratively computes PageRank for each node.
def computePR(senderGraph, recipientGraph):
	N = len(recipientGraph)

	# Sets up data structures for PageRank analysis.
	currentPR, sinks = setupPR(senderGraph)
	nextPR = {}

	# Iterates pageRank computation ITERATIONS times.
	for i in range(ITERATIONS):
		# Sums PageRank over sinks
		sinkSum = 0
		for sink in sinks:
			sinkSum += currentPR[sink]

		# Goes through each node in the graph.
		# Computes the sum of PageRank coming from each sender.
		for recipient, senders in recipientGraph.iteritems():
			incomingPR = 0
		
			for sender in senders:
				outLinks = len(senderGraph[sender])
			
				if outLinks > 0:
					incomingPR += currentPR[sender] / outLinks

			nextPR[recipient] = (1 - L + L * sinkSum) / N + L * incomingPR
	
		# Sets the newly computed PageRank scores as current PageRank.
		currentPR = copy.deepcopy(nextPR)

	return currentPR


# FLOW
senders, recipients = readGraph()
PR = computePR(senders, recipients)
saveAsJSON(senders, PR)